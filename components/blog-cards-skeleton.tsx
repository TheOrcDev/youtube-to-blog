import { Skeleton } from "@/components/ui/skeleton";

const BLOG_CARD_SKELETON_KEYS = [
  "blog-card-a",
  "blog-card-b",
  "blog-card-c",
  "blog-card-d",
] as const;

const LINE_KEYS = ["line-a", "line-b", "line-c"] as const;

function BlogCardSkeleton() {
  return (
    <article className="flex h-full flex-col gap-1 rounded-2xl border bg-muted p-1">
      <div className="rounded-lg border bg-card p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-5 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
      <div className="flex-1 rounded-lg border bg-card px-4 py-2">
        {LINE_KEYS.map((key) => (
          <div
            className="flex items-center justify-between gap-3 py-2.5"
            key={key}
          >
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </article>
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
