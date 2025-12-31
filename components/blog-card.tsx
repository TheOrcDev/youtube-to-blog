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
    <Card>
      <CardHeader>
        <CardTitle>{blog.title}</CardTitle>
        <CardDescription>YouTube ID: {blog.slug}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{blog.content.substring(0, MAX_CONTENT_LENGTH)}...</p>
      </CardContent>
      <CardFooter>
        <p>Created at: {blog.createdAt.toLocaleDateString()}</p>
      </CardFooter>
    </Card>
  );
}
