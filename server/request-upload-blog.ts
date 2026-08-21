"use server";

import { del } from "@vercel/blob";
import { generateText as generateAiText } from "ai";

import { isBillingEnabled } from "@/lib/billing/enabled";
import { isAdminEmail } from "@/lib/entitlements/admin";
import { isWritingStyleId } from "@/lib/writing-styles";
import { assertAiGatewayConfiguration } from "./ai-gateway";
import { toPublicBlogError } from "./blog-errors";
import type { BlogRequestResult } from "./blog-request";
import { createBlog } from "./blogs";
import { createGenerationAllowance } from "./generation-allowance";
import { getSavedWritingStyleForUser } from "./preferences";
import { createUploadAllowance } from "./upload-allowance";
import {
  createUploadBlogGenerator,
  type UploadBlogInput,
} from "./upload-blog-generator";
import { countBlogsCreatedSince, getEntitlementTier } from "./usage";
import { getCurrentUser } from "./users";

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

// Only fetch from Vercel Blob: the URL comes from the client, so anything else
// would let a caller point the server at arbitrary (or internal) hosts.
async function fetchUploadBytes(url: string): Promise<Uint8Array> {
  const parsed = new URL(url);

  if (!parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) {
    throw new Error("Upload URL is not a Vercel Blob URL");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch upload (status ${response.status})`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function deleteUpload(url: string): Promise<void> {
  await del(url);
}

const isAdmin = (email: string | null | undefined) =>
  isAdminEmail(email, process.env.ADMIN_EMAILS);

const generateBlogFromUpload = createUploadBlogGenerator({
  checkGenerationAllowance: createGenerationAllowance({
    countBlogsCreatedSince,
    getEntitlementTier,
    isAdmin,
    isBillingEnabled,
  }),
  checkUploadAllowance: createUploadAllowance({
    getEntitlementTier,
    isAdmin,
    isBillingEnabled,
  }),
  createBlog,
  deleteUpload,
  fetchUploadBytes,
  generateText: ({ messages, model }) => generateAiText({ messages, model }),
  getCurrentUser,
  getSavedWritingStyle: getSavedWritingStyleForUser,
});

// styleId is client-provided, so it's validated rather than trusted; an
// unknown value falls back to the user's saved default.
export async function requestUploadBlog(
  input: UploadBlogInput,
  styleId?: string
): Promise<BlogRequestResult<Awaited<ReturnType<typeof createBlog>>>> {
  try {
    assertAiGatewayConfiguration({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
    });

    const blog = await generateBlogFromUpload(
      input,
      styleId && isWritingStyleId(styleId) ? { id: styleId } : undefined
    );

    return { blog, ok: true, status: "created" };
  } catch (error) {
    // The client only ever sees a safe code and message, so the real cause
    // chain must land in the server logs or production failures are opaque.
    console.error("Upload blog generation failed:", error);

    return { error: toPublicBlogError(error), ok: false };
  }
}
