import Image from "next/image";
import { Suspense } from "react";

import { UsageIndicator } from "@/components/billing/usage-indicator";
import { MainForm } from "@/components/forms/main-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function Generate() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-10rem)] w-full max-w-3xl flex-col items-center justify-center px-4 py-16">
      <div className="flex w-full flex-col items-center text-center">
        <Image
          alt="YouTube to Blog"
          className="h-auto w-32 sm:w-44"
          height={500}
          priority
          src="/youtube-to-blog-logo.png"
          width={500}
        />

        <h1 className="mt-4 text-balance font-bold text-3xl sm:text-4xl">
          Turn any YouTube video into a blog post
        </h1>

        <p className="mt-3 max-w-xl text-balance text-muted-foreground">
          Paste a link and get a structured, ready-to-publish article in seconds
          — written by AI and exportable as Markdown.
        </p>

        <div className="mt-6 w-full">
          <MainForm />
        </div>
        <Suspense fallback={<Skeleton className="mt-3 h-5 w-64" />}>
          <UsageIndicator />
        </Suspense>
      </div>
    </main>
  );
}
