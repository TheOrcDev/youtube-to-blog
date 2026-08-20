import { Suspense } from "react";

import { UsageIndicator } from "@/components/billing/usage-indicator";
import { MainForm } from "@/components/forms/main-form";
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { canUploadVideos } from "@/server/usage";

// Blog generation runs inside a server action invoked from this page; long
// videos need more than the default function duration.
export const maxDuration = 300;

// canUploadVideos reads auth headers, so it must render inside <Suspense> to
// keep the rest of the page statically prerenderable.
async function ConvertForm() {
  const canUpload = await canUploadVideos();

  return <MainForm canUpload={canUpload} />;
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4">
      <section
        className="flex min-h-[calc(100svh-10rem)] flex-col items-center justify-center py-16 text-center"
        id="convert"
      >
        <Logo className="w-32 sm:w-44" priority size={176} />

        <h1 className="mt-4 max-w-2xl text-balance font-bold text-3xl sm:text-4xl">
          Turn any video into a blog post
        </h1>

        <p className="mt-3 max-w-xl text-balance text-muted-foreground">
          Paste a YouTube link or upload a video. AI watches it — audio and
          visuals — and writes a structured, ready-to-publish article you can
          export as Markdown or fetch over the API.
        </p>

        <div className="mt-6 flex w-full max-w-3xl flex-col items-center">
          <Suspense fallback={<Skeleton className="h-24 w-full" />}>
            <ConvertForm />
          </Suspense>
        </div>
        <Suspense fallback={<Skeleton className="mt-3 h-5 w-64" />}>
          <UsageIndicator />
        </Suspense>
      </section>
    </main>
  );
}
