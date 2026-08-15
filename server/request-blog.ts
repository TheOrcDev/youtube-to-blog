"use server";

import { generateBlog } from "./ai";
import { createBlogRequest } from "./blog-request";
import { checkBlogExists } from "./blogs";

const requestBlogWithDependencies = createBlogRequest({
  checkBlogExists,
  generateBlog,
});

export async function requestBlog(youtubeUrl: string) {
  return await requestBlogWithDependencies(youtubeUrl);
}
