import Image from "next/image";
import { Suspense } from "react";
import { UsageIndicator } from "@/components/billing/usage-indicator";
import { MainForm } from "@/components/forms/main-form";

export default function Generate() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center justify-center p-4">
      <div className="absolute top-1/2 left-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-2">
        <div className="mb-6 flex flex-col items-center text-center">
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
            Paste a link and get a structured, ready-to-publish article in
            seconds — written by AI and exportable as Markdown.
          </p>
        </div>

        <MainForm />
        <Suspense fallback={null}>
          <UsageIndicator />
        </Suspense>
      </div>
    </main>
  );
}
