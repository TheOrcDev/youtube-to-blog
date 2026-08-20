import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { MainForm } from "@/components/forms/main-form";
import { Skeleton } from "@/components/ui/skeleton";
import { canUploadVideos } from "@/server/usage";

export const metadata: Metadata = {
  title: "New blog",
};

// Blog generation runs inside a server action invoked from this page; long
// videos need more than the default function duration.
export const maxDuration = 300;

// canUploadVideos reads auth headers, so it must render inside <Suspense> to
// keep the rest of the page statically prerenderable.
async function ConvertForm() {
  const canUpload = await canUploadVideos();

  return <MainForm canUpload={canUpload} />;
}

export default function NewBlogPage() {
  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Paste a YouTube link or upload a video and we will write the article."
        eyebrow="Create"
        title="New blog"
      />
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <ConvertForm />
      </Suspense>
    </DashboardPageShell>
  );
}
