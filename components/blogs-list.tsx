import Link from "next/link";
import { getBlogsByUser } from "@/server/blogs";
import { BlogCard } from "./blog-card";
import { CopyMarkdownButton } from "./copy-markdown-button";
import { Button } from "./ui/button";

export async function BlogsList() {
  const blogs = await getBlogsByUser();

  return (
    <>
      {blogs.map((blog) => (
        <div className="flex flex-col gap-4" key={blog.id}>
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline">
              <Link href={`/blog/${blog.slug}`}>View Blog</Link>
            </Button>

            <CopyMarkdownButton content={blog.content} />
          </div>
          <BlogCard blog={blog} />
        </div>
      ))}
    </>
  );
}
