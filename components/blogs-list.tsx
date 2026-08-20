import Link from "next/link";

import { BlogCard } from "@/components/blog-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getBlogsByUser } from "@/server/blogs";

export async function BlogsList() {
  const blogs = await getBlogsByUser();

  if (blogs.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No blogs yet</EmptyTitle>
          <EmptyDescription>
            Convert a YouTube video to create your first post.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link className={buttonVariants()} href="/dashboard/new">
            New blog
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {blogs.map((blog) => (
        <BlogCard blog={blog} key={blog.id} />
      ))}
    </section>
  );
}
