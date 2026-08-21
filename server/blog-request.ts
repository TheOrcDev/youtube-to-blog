import { type PublicBlogError, toPublicBlogError } from "./blog-errors.ts";
import type { WritingStyleOverride } from "./writing-style.ts";

interface BlogRequestDependencies<Blog> {
  checkBlogExists: (youtubeUrl: string) => Promise<Blog | null | undefined>;
  generateBlog: (
    youtubeUrl: string,
    styleOverride?: WritingStyleOverride
  ) => Promise<Blog>;
}

export type BlogRequestResult<Blog> =
  | {
      blog: Blog;
      ok: true;
      status: "created" | "existing";
    }
  | {
      error: PublicBlogError;
      ok: false;
    };

export function createBlogRequest<Blog>({
  checkBlogExists,
  generateBlog,
}: BlogRequestDependencies<Blog>) {
  return async function requestBlog(
    youtubeUrl: string,
    styleOverride?: WritingStyleOverride
  ): Promise<BlogRequestResult<Blog>> {
    try {
      const existingBlog = await checkBlogExists(youtubeUrl);

      if (existingBlog) {
        return {
          blog: existingBlog,
          ok: true,
          status: "existing",
        };
      }

      const blog = await generateBlog(youtubeUrl, styleOverride);

      return {
        blog,
        ok: true,
        status: "created",
      };
    } catch (error) {
      // The client only ever sees a safe code and message, so the real cause
      // chain must land in the server logs or production failures are opaque.
      console.error("Blog generation failed:", error);

      return {
        error: toPublicBlogError(error),
        ok: false,
      };
    }
  };
}
