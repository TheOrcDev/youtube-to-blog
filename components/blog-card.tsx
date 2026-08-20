import Link from "next/link";

import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SelectBlog } from "@/db/schema";

interface BlogCardProps {
  blog: SelectBlog;
}

const MAX_CONTENT_LENGTH = 100;

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
        <CardDescription>
          {blog.slug} · {blog.createdAt.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm">
          {blog.content.substring(0, MAX_CONTENT_LENGTH)}...
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild variant="outline">
          <Link href={`/blog/${blog.slug}`}>View</Link>
        </Button>
        <CopyMarkdownButton content={blog.content} />
      </CardFooter>
    </Card>
  );
}
