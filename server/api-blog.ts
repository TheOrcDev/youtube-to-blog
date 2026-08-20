import { generateText as generateAiText } from "ai";

import { db } from "@/db/drizzle";
import { blogs, type InsertBlog, type SelectBlog } from "@/db/schema";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { isAdminEmail } from "@/lib/entitlements/admin";
import { assertAiGatewayConfiguration } from "./ai-gateway";
import type { ApiUser } from "./api-auth";
import { createBlogGenerator } from "./blog-generator";
import { type BlogRequestResult, createBlogRequest } from "./blog-request";
import { checkBlogExists } from "./blogs";
import { createGenerationAllowance } from "./generation-allowance";
import { countBlogsCreatedSince, getEntitlementTier } from "./usage";
import { extractYouTubeMetadata } from "./youtube";

const TRAILING_SLASH_REGEX = /\/$/;

// Direct insert: API callers are authenticated by key, not session, so the
// session-bound createBlog server action cannot be used here.
async function insertBlog(blog: InsertBlog): Promise<SelectBlog> {
  const [row] = await db.insert(blogs).values(blog).returning();

  return row;
}

export async function requestBlogForApiUser(
  user: ApiUser,
  youtubeUrl: string
): Promise<BlogRequestResult<SelectBlog>> {
  const generateBlog = createBlogGenerator<SelectBlog>({
    checkGenerationAllowance: createGenerationAllowance({
      countBlogsCreatedSince,
      getEntitlementTier,
      isAdmin: (email) => isAdminEmail(email, process.env.ADMIN_EMAILS),
      isBillingEnabled,
    }),
    createBlog: insertBlog,
    extractYouTubeMetadata,
    generateText: ({ messages, model }) => generateAiText({ messages, model }),
    getCurrentUser: () => Promise.resolve({ user }),
  });

  const requestBlog = createBlogRequest({ checkBlogExists, generateBlog });

  assertAiGatewayConfiguration({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    oidcToken: process.env.VERCEL_OIDC_TOKEN,
  });

  return await requestBlog(youtubeUrl);
}

export interface ApiBlog {
  author: string;
  content?: string;
  createdAt: string;
  slug: string;
  sourceType: string;
  title: string;
  url: string;
}

export function serializeBlog(
  blog: SelectBlog,
  { includeContent }: { includeContent: boolean }
): ApiBlog {
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "").replace(
    TRAILING_SLASH_REGEX,
    ""
  );

  return {
    author: blog.author,
    ...(includeContent ? { content: blog.content } : {}),
    createdAt: blog.createdAt.toISOString(),
    slug: blog.slug,
    sourceType: blog.sourceType,
    title: blog.title,
    url: `${origin}/blog/${encodeURIComponent(blog.slug)}`,
  };
}
