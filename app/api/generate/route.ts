import { type ModelMessage, streamText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { isAdminEmail } from "@/lib/entitlements/admin";
import type { GenerationStreamEvent } from "@/lib/generation-stream";
import { isWritingStyleId } from "@/lib/writing-styles";
import { assertAiGatewayConfiguration } from "@/server/ai-gateway";
import { insertBlog } from "@/server/api-blog";
import { BlogWorkflowError, toPublicBlogError } from "@/server/blog-errors";
import { createBlogGenerator } from "@/server/blog-generator";
import { createBlogRequest } from "@/server/blog-request";
import { checkBlogExists } from "@/server/blogs";
import { createGenerationAllowance } from "@/server/generation-allowance";
import { getSavedWritingStyleForUser } from "@/server/preferences";
import { createUploadAllowance } from "@/server/upload-allowance";
import { createUploadBlogGenerator } from "@/server/upload-blog-generator";
import { deleteUpload, fetchUploadBytes } from "@/server/upload-source";
import { countBlogsCreatedSince, getEntitlementTier } from "@/server/usage";
import type { WritingStyleOverride } from "@/server/writing-style";
import { extractYouTubeMetadata } from "@/server/youtube";

// Generation streams for the whole run; long videos can take a few minutes.
export const maxDuration = 300;

const bodySchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("youtube"),
    styleId: z.string().optional(),
    youtubeUrl: z.url(),
  }),
  z.object({
    filename: z.string().min(1),
    mediaType: z.string().min(1),
    source: z.literal("upload"),
    styleId: z.string().optional(),
    uploadUrl: z.url(),
  }),
]);

type GenerateBody = z.infer<typeof bodySchema>;

interface SessionUser {
  email?: string | null;
  id: string;
  name?: string | null;
}

type WriteEvent = (event: GenerationStreamEvent) => void;

const isAdmin = (email: string | null | undefined) =>
  isAdminEmail(email, process.env.ADMIN_EMAILS);

function buildAllowanceCheck() {
  return createGenerationAllowance({
    countBlogsCreatedSince,
    getEntitlementTier,
    isAdmin,
    isBillingEnabled,
  });
}

// Drop-in replacement for the generators' generateText dependency: same
// input and output contract, but forwards thinking and article deltas to the
// client while the model works.
function createStreamingGenerateText(write: WriteEvent) {
  return async ({
    messages,
    model,
  }: {
    messages: ModelMessage[];
    model: string;
  }): Promise<{ text: string }> => {
    write({ stage: "generating", type: "status" });

    const result = streamText({
      messages,
      model,
      providerOptions: {
        google: { thinkingConfig: { includeThoughts: true } },
      },
    });

    for await (const part of result.fullStream) {
      if (part.type === "reasoning-delta") {
        write({ text: part.text, type: "thinking" });
      } else if (part.type === "text-delta") {
        write({ text: part.text, type: "article" });
      } else if (part.type === "error") {
        throw part.error;
      }
    }

    return { text: await result.text };
  };
}

function toStyleOverride(styleId?: string): WritingStyleOverride | undefined {
  return styleId && isWritingStyleId(styleId) ? { id: styleId } : undefined;
}

async function runYoutubeGeneration(
  write: WriteEvent,
  user: SessionUser,
  body: Extract<GenerateBody, { source: "youtube" }>
) {
  const generateBlog = createBlogGenerator({
    checkGenerationAllowance: buildAllowanceCheck(),
    createBlog: (blog) => {
      write({ stage: "saving", type: "status" });
      return insertBlog(blog);
    },
    extractYouTubeMetadata: (url) => {
      write({ stage: "fetching", type: "status" });
      return extractYouTubeMetadata(url);
    },
    generateText: createStreamingGenerateText(write),
    getCurrentUser: () => Promise.resolve({ user }),
    getSavedWritingStyle: getSavedWritingStyleForUser,
  });

  const requestBlog = createBlogRequest({ checkBlogExists, generateBlog });

  write({ stage: "checking", type: "status" });

  return await requestBlog(body.youtubeUrl, toStyleOverride(body.styleId));
}

async function runUploadGeneration(
  write: WriteEvent,
  user: SessionUser,
  body: Extract<GenerateBody, { source: "upload" }>
) {
  const generateBlogFromUpload = createUploadBlogGenerator({
    checkGenerationAllowance: buildAllowanceCheck(),
    checkUploadAllowance: createUploadAllowance({
      getEntitlementTier,
      isAdmin,
      isBillingEnabled,
    }),
    createBlog: (blog) => {
      write({ stage: "saving", type: "status" });
      return insertBlog(blog);
    },
    deleteUpload,
    fetchUploadBytes: (url) => {
      write({ stage: "fetching", type: "status" });
      return fetchUploadBytes(url);
    },
    generateText: createStreamingGenerateText(write),
    getCurrentUser: () => Promise.resolve({ user }),
    getSavedWritingStyle: getSavedWritingStyleForUser,
  });

  write({ stage: "checking", type: "status" });

  try {
    const blog = await generateBlogFromUpload(
      {
        filename: body.filename,
        mediaType: body.mediaType,
        uploadUrl: body.uploadUrl,
      },
      toStyleOverride(body.styleId)
    );

    return { blog, ok: true as const, status: "created" as const };
  } catch (error) {
    // The client only ever sees a safe code and message, so the real cause
    // chain must land in the server logs or production failures are opaque.
    console.error("Upload blog generation failed:", error);

    return { error: toPublicBlogError(error), ok: false as const };
  }
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json(
      { error: toPublicBlogError(new BlogWorkflowError("AUTH_REQUIRED")) },
      { status: 401 }
    );
  }

  let body: GenerateBody;

  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const user: SessionUser = {
    email: session.user.email,
    id: session.user.id,
    name: session.user.name,
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;

      const write: WriteEvent = (event) => {
        if (closed) {
          return;
        }

        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // The client went away mid-stream; generation continues (or is
          // abandoned) server-side, and nothing more can be delivered.
          closed = true;
        }
      };

      try {
        assertAiGatewayConfiguration({
          apiKey: process.env.AI_GATEWAY_API_KEY,
          oidcToken: process.env.VERCEL_OIDC_TOKEN,
        });

        const result =
          body.source === "youtube"
            ? await runYoutubeGeneration(write, user, body)
            : await runUploadGeneration(write, user, body);

        if (result.ok) {
          write({ blog: result.blog, status: result.status, type: "blog" });
        } else {
          write({ error: result.error, type: "error" });
        }
      } catch (error) {
        console.error("Streaming generation failed:", error);
        write({ error: toPublicBlogError(error), type: "error" });
      } finally {
        if (!closed) {
          controller.close();
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-store",
      "content-type": "application/x-ndjson; charset=utf-8",
    },
  });
}
