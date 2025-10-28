import { Suspense } from "react";
import { BlogsList } from "@/components/blogs-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogsPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-4 px-5 py-10">
      <Suspense
        fallback={
          <div className="flex flex-col justify-end gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-30" />
              </div>
              <Skeleton className="h-50 w-full" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-30" />
              </div>
              <Skeleton className="h-50 w-full" />
            </div>
          </div>
        }
      >
        <BlogsList />
      </Suspense>
    </div>
  );
}
