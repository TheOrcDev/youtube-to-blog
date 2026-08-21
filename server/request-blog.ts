"use server";

import { isWritingStyleId } from "@/lib/writing-styles";
import { generateBlog } from "./ai";
import { createBlogRequest } from "./blog-request";
import { checkBlogExists } from "./blogs";

const requestBlogWithDependencies = createBlogRequest({
  checkBlogExists,
  generateBlog,
});

// styleId is client-provided, so it's validated rather than trusted; an
// unknown value falls back to the user's saved default.
export async function requestBlog(youtubeUrl: string, styleId?: string) {
  const override =
    styleId && isWritingStyleId(styleId) ? { id: styleId } : undefined;

  return await requestBlogWithDependencies(youtubeUrl, override);
}
