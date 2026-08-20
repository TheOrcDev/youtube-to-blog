import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogsList } from "@/components/blogs-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My blogs",
};

export default function DashboardBlogsPage() {
  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Every article you have generated from a YouTube video."
        eyebrow="Your library"
        title="My blogs"
      />
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        }
      >
        <BlogsList />
      </Suspense>
    </DashboardPageShell>
  );
}
