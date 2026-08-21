"use server";

import { generateText as generateAiText } from "ai";

import { isBillingEnabled } from "@/lib/billing/enabled";
import { isAdminEmail } from "@/lib/entitlements/admin";
import { assertAiGatewayConfiguration } from "./ai-gateway";
import { createBlogGenerator } from "./blog-generator";
import { createBlog } from "./blogs";
import { createGenerationAllowance } from "./generation-allowance";
import { getSavedWritingStyleForUser } from "./preferences";
import { countBlogsCreatedSince, getEntitlementTier } from "./usage";
import { getCurrentUser } from "./users";
import type { WritingStyleOverride } from "./writing-style";
import { extractYouTubeMetadata } from "./youtube";

const generateBlogWithDependencies = createBlogGenerator({
  checkGenerationAllowance: createGenerationAllowance({
    countBlogsCreatedSince,
    getEntitlementTier,
    isAdmin: (email) => isAdminEmail(email, process.env.ADMIN_EMAILS),
    isBillingEnabled,
  }),
  createBlog,
  extractYouTubeMetadata,
  generateText: ({ messages, model }) => generateAiText({ messages, model }),
  getCurrentUser,
  getSavedWritingStyle: getSavedWritingStyleForUser,
});

export async function generateBlog(
  youtubeUrl: string,
  styleOverride?: WritingStyleOverride
) {
  assertAiGatewayConfiguration({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    oidcToken: process.env.VERCEL_OIDC_TOKEN,
  });

  return await generateBlogWithDependencies(youtubeUrl, styleOverride);
}
