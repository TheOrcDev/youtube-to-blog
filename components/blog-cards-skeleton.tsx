import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BLOG_CARD_SKELETON_KEYS = [
  "blog-card-a",
  "blog-card-b",
  "blog-card-c",
  "blog-card-d",
] as const;

function BlogCardSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-36" />
      </CardFooter>
    </Card>
  );
}

export function BlogCardsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading blogs"
      className="grid gap-4 sm:grid-cols-2"
    >
      {BLOG_CARD_SKELETON_KEYS.map((key) => (
        <BlogCardSkeleton key={key} />
      ))}
    </section>
  );
}
