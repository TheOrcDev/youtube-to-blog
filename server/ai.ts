"use server";

import { generateText as generateAiText } from "ai";

import { assertAiGatewayConfiguration } from "./ai-gateway";
import { createBlogGenerator } from "./blog-generator";
import { createBlog } from "./blogs";
import { getCurrentUser } from "./users";
import { extractYouTubeMetadata } from "./youtube";

const generateBlogWithDependencies = createBlogGenerator({
  createBlog,
  extractYouTubeMetadata,
  generateText: ({ messages, model }) => generateAiText({ messages, model }),
  getCurrentUser,
});

export async function generateBlog(youtubeUrl: string) {
  assertAiGatewayConfiguration({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    oidcToken: process.env.VERCEL_OIDC_TOKEN,
  });

  return await generateBlogWithDependencies(youtubeUrl);
}
