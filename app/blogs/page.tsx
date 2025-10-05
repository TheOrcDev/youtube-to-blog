import Link from "next/link";
import { BlogCard } from "@/components/blog-card";
import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { Button } from "@/components/ui/button";
import { getBlogsByUser } from "@/server/blogs";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await getBlogsByUser();

  return (
    <div className="container mx-auto max-w-3xl space-y-4 px-5 py-10">
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
    </div>
  );
}
