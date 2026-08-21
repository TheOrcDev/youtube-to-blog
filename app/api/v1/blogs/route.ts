import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { blogs } from "@/db/schema";
import {
  MAX_STYLE_INSTRUCTIONS_LENGTH,
  WRITING_STYLE_IDS,
  type WritingStyleId,
} from "@/lib/writing-styles";
import { authenticateApiRequest } from "@/server/api-auth";
import { requestBlogForApiUser, serializeBlog } from "@/server/api-blog";
import { getBlogErrorStatus, toPublicBlogError } from "@/server/blog-errors";

// Blog generation is synchronous and can take a couple of minutes for long
// videos.
export const maxDuration = 300;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createBlogSchema = z.object({
  style: z
    .enum(WRITING_STYLE_IDS as [WritingStyleId, ...WritingStyleId[]])
    .optional(),
  styleInstructions: z.string().max(MAX_STYLE_INSTRUCTIONS_LENGTH).optional(),
  youtubeUrl: z.url(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const authResult = await authenticateApiRequest(request);

  if (!authResult.ok) {
    return NextResponse.json(authResult.body, { status: authResult.status });
  }

  let parsedBody: z.infer<typeof createBlogSchema>;

  try {
    parsedBody = createBlogSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message:
            'Send a JSON body with a "youtubeUrl" string, e.g. {"youtubeUrl": "https://www.youtube.com/watch?v=..."}.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const result = await requestBlogForApiUser(
      authResult.user,
      parsedBody.youtubeUrl,
      {
        id: parsedBody.style,
        instructions: parsedBody.styleInstructions,
      }
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: getBlogErrorStatus(result.error) }
      );
    }

    return NextResponse.json(
      {
        blog: serializeBlog(result.blog, { includeContent: true }),
        status: result.status,
      },
      { status: result.status === "created" ? 201 : 200 }
    );
  } catch (error) {
    const publicError = toPublicBlogError(error);

    return NextResponse.json(
      { error: publicError },
      { status: getBlogErrorStatus(publicError) }
    );
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const authResult = await authenticateApiRequest(request);

  if (!authResult.ok) {
    return NextResponse.json(authResult.body, { status: authResult.status });
  }

  const url = new URL(request.url);
  const limitParam = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
  const offsetParam = Number.parseInt(url.searchParams.get("offset") ?? "", 10);
  const limit = Number.isNaN(limitParam)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(limitParam, 1), MAX_LIMIT);
  const offset = Number.isNaN(offsetParam) ? 0 : Math.max(offsetParam, 0);

  const rows = await db
    .select()
    .from(blogs)
    .where(eq(blogs.userId, authResult.user.id))
    .orderBy(desc(blogs.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    blogs: rows.map((blog) => serializeBlog(blog, { includeContent: false })),
    pagination: { limit, offset },
  });
}
