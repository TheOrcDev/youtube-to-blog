import { type PublicBlogError, toPublicBlogError } from "./blog-errors.ts";

interface BlogRequestDependencies<Blog> {
  checkBlogExists: (youtubeUrl: string) => Promise<Blog | null | undefined>;
  generateBlog: (youtubeUrl: string) => Promise<Blog>;
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
    youtubeUrl: string
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

      const blog = await generateBlog(youtubeUrl);

      return {
        blog,
        ok: true,
        status: "created",
      };
    } catch (error) {
      return {
        error: toPublicBlogError(error),
        ok: false,
      };
    }
  };
}
