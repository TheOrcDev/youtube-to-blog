import {
  ArrowRight,
  Eye,
  FileText,
  FolderOpen,
  Link2,
  PenLine,
  Sparkles,
  Upload,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { UsageIndicator } from "@/components/billing/usage-indicator";
import { MainForm } from "@/components/forms/main-form";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FREE_MONTHLY_GENERATIONS,
  PRO_MONTHLY_GENERATIONS,
} from "@/lib/entitlements/policy";
import { canUploadVideos } from "@/server/usage";

// Blog generation runs inside a server action invoked from this page; long
// videos need more than the default function duration.
export const maxDuration = 300;

const STEPS = [
  {
    description:
      "Paste a YouTube link, or upload your own MP4, WebM, or QuickTime file. No captions or transcript needed.",
    icon: Link2,
    title: "Add your video",
  },
  {
    description:
      "The AI watches the actual video — audio and visuals — and writes a structured, first-person article from it.",
    icon: Eye,
    title: "AI watches and writes",
  },
  {
    description:
      "Copy the finished post as Markdown and publish it on your blog, docs, or newsletter. It's yours.",
    icon: FileText,
    title: "Copy and publish",
  },
] as const;

const FEATURES = [
  {
    description:
      "No transcripts or captions required. The AI understands what is said and what is shown on screen — code, slides, demos.",
    icon: Eye,
    title: "True video understanding",
  },
  {
    description:
      "Works with any public YouTube link. Paste it and get an article in about a minute.",
    icon: Youtube,
    title: "YouTube links",
  },
  {
    description:
      "Turn unlisted recordings, screencasts, and talks into articles by uploading the file directly. Videos are deleted right after the post is written.",
    icon: Upload,
    title: "Upload your own videos",
  },
  {
    description:
      "Posts are written in first person with an introduction, clear sections, and a conclusion — like you wrote them yourself.",
    icon: PenLine,
    title: "Authentic first-person voice",
  },
  {
    description:
      "Every post is clean Markdown/MDX, ready to paste into any blog platform, CMS, or static site.",
    icon: Sparkles,
    title: "Markdown export",
  },
  {
    description:
      "All your generated posts live in one dashboard, stored forever, ready to copy again anytime.",
    icon: FolderOpen,
    title: "Your content library",
  },
] as const;

const USE_CASES = [
  {
    description:
      "Every video you publish can also rank on Google. Repurpose your channel into SEO-friendly articles without rewriting anything.",
    title: "Content creators",
  },
  {
    description:
      "Turn conference talks, tutorials, and screencasts into technical posts — the AI picks up the code on screen, not just the narration.",
    title: "Developers",
  },
  {
    description:
      "Convert internal recordings, demos, and training sessions into written documentation your team can search and share.",
    title: "Teams",
  },
] as const;

const FAQ = [
  {
    answer:
      "No. Unlike transcript-based tools, the AI watches the video itself — audio and visuals. Videos without captions, in any spoken language, work fine.",
    question: "Does the video need captions or a transcript?",
  },
  {
    answer:
      "Yes. Uploading your own videos is a Pro feature. MP4, WebM, and QuickTime files up to 64MB are supported — that covers most screen recordings and talk-length exports. For bigger files, compress the video or trim it first.",
    question: "Can I convert videos that are not on YouTube?",
  },
  {
    answer:
      "Uploaded videos are deleted from storage as soon as the blog post is written — whether generation succeeds or fails. The article text is the only thing we keep, and it belongs to you.",
    question: "What happens to videos I upload?",
  },
  {
    answer:
      "You do. Every generated post is yours to edit, publish, and monetize however you like, exported as clean Markdown.",
    question: "Who owns the generated content?",
  },
  {
    answer: `The Free plan includes ${FREE_MONTHLY_GENERATIONS} blog posts per month from YouTube links. Pro raises that to ${PRO_MONTHLY_GENERATIONS} posts per month, unlocks video uploads, and uses a premium AI model for richer writing.`,
    question: "What do I get for free?",
  },
  {
    answer:
      "Yes. Pro users can generate and fetch blog posts over a REST API — create a key in dashboard settings and see the API docs at /docs/api. Perfect for automating your publishing pipeline.",
    question: "Is there an API?",
  },
  {
    answer:
      "Yes — the whole project is open source. Self-host it with your own API keys and every feature is unlocked with no limits or subscription.",
    question: "Can I self-host it?",
  },
] as const;

// canUploadVideos reads auth headers, so it must render inside <Suspense> to
// keep the rest of the page statically prerenderable.
async function ConvertForm() {
  const canUpload = await canUploadVideos();

  return <MainForm canUpload={canUpload} />;
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4">
      {/* Hero */}
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
          export as Markdown.
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

      {/* How it works */}
      <section className="py-16">
        <h2 className="text-center font-bold text-2xl sm:text-3xl">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              className="flex flex-col items-center text-center"
              key={step.title}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <step.icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <h2 className="text-center font-bold text-2xl sm:text-3xl">
          Everything you need to go from video to article
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
                <CardTitle className="mt-2">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16">
        <h2 className="text-center font-bold text-2xl sm:text-3xl">
          Built for people who talk on camera
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {USE_CASES.map((useCase) => (
            <Card key={useCase.title}>
              <CardHeader>
                <CardTitle>{useCase.title}</CardTitle>
                <CardDescription>{useCase.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Start free, upgrade when you need more
            </CardTitle>
            <CardDescription className="mx-auto max-w-xl">
              Free gets you {FREE_MONTHLY_GENERATIONS} blog posts a month from
              YouTube links. Pro raises the limit to {PRO_MONTHLY_GENERATIONS},
              unlocks video uploads, and uses a premium AI model for richer
              writing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/pricing">
                See pricing
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <h2 className="text-center font-bold text-2xl sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-8">
          {FAQ.map((item) => (
            <div key={item.question}>
              <h3 className="font-semibold">{item.question}</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="font-bold text-2xl sm:text-3xl">
          Your next blog post is already recorded
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Paste a link or upload a video and read the finished article a minute
          later.
        </p>
        <Button asChild size="lg">
          <Link href="#convert">
            Convert a video
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
