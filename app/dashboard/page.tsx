import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogCardsSkeleton } from "@/components/blog-cards-skeleton";
import { BlogsList } from "@/components/blogs-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";

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
      <Suspense fallback={<BlogCardsSkeleton />}>
        <BlogsList />
      </Suspense>
    </DashboardPageShell>
  );
}
