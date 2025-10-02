import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why Multiple Blogs Drive More Traffic and Conversions",
  description:
    "Discover how creating multiple blog posts from your YouTube videos can dramatically increase your search engine visibility, AI discoverability, and overall traffic potential.",
  keywords: [
    "blog SEO benefits",
    "multiple blog posts",
    "search engine optimization",
    "AI content discovery",
    "content marketing strategy",
    "blog traffic generation",
    "YouTube to blog conversion",
    "content diversification",
    "SEO ranking factors",
    "content discoverability",
  ],
  openGraph: {
    title: "Why Multiple Blogs Drive More Traffic and Conversions",
    description:
      "Discover how creating multiple blog posts from your YouTube videos can dramatically increase your search engine visibility, AI discoverability, and overall traffic potential.",
    type: "article",
  },
};

export default function WhyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Button
        asChild
        className="-translate-x-1/2 absolute top-4 left-1/2 mx-auto"
        variant="outline"
      >
        <Link href="/">Back</Link>
      </Button>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="mb-8 font-bold text-4xl">
          Why Multiple Blogs Drive More Traffic and Conversions
        </h1>

        <div className="mb-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-950/20">
          <p className="font-medium text-blue-900 text-lg dark:text-blue-100">
            Transform a single YouTube video into multiple blog posts and watch
            your discoverability, traffic, and conversion potential multiply
            exponentially.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="mb-6 font-semibold text-3xl">
            The Power of Content Multiplication
          </h2>
          <p className="mb-4 text-lg leading-relaxed">
            In today's digital landscape, discoverability is everything. While a
            single YouTube video might reach your existing audience, converting
            it into multiple blog posts creates numerous entry points for new
            visitors to find your content through search engines and AI systems.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <h3 className="mb-3 font-semibold text-xl">
                🎯 Targeted Keywords
              </h3>
              <p>
                Each blog post can target different long-tail keywords,
                capturing searches your video might miss. A 30-minute coding
                tutorial becomes 5-10 focused articles on specific topics.
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="mb-3 font-semibold text-xl">
                🔍 Search Intent Matching
              </h3>
              <p>
                Different blog posts can address various search intents - from
                "how to" guides to "what is" explanations, maximizing your
                chances of appearing in relevant searches.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 font-semibold text-3xl">
            SEO Benefits: The Compound Effect
          </h2>

          <div className="mb-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <span className="font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold">
                  Increased Indexing Opportunities
                </h3>
                <p className="text-muted-foreground">
                  More pages = more chances for search engines to index and rank
                  your content. Each blog post is a separate opportunity to
                  capture organic traffic.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <span className="font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Internal Linking Power</h3>
                <p className="text-muted-foreground">
                  Multiple related blog posts create a web of internal links,
                  boosting the authority and ranking potential of your entire
                  content ecosystem.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <span className="font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Long-tail Keyword Domination</h3>
                <p className="text-muted-foreground">
                  Target specific, less competitive keywords that your
                  competitors might overlook, building a strong foundation of
                  niche authority.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 font-semibold text-3xl">
            AI and Modern Discovery
          </h2>
          <p className="mb-6 text-lg leading-relaxed">
            As AI systems like ChatGPT, Claude, and search engines become more
            sophisticated, they're increasingly trained on diverse,
            well-structured content. Multiple blog posts give you more
            opportunities to be referenced and recommended by these systems.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-6 dark:from-purple-950/20 dark:to-blue-950/20">
              <h3 className="mb-3 font-semibold text-lg">
                🤖 AI Training Data
              </h3>
              <p className="text-sm">
                Your content becomes part of AI training datasets, increasing
                the likelihood of being referenced in AI-generated responses.
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:from-green-950/20 dark:to-emerald-950/20">
              <h3 className="mb-3 font-semibold text-lg">📊 Rich Snippets</h3>
              <p className="text-sm">
                Multiple articles increase your chances of appearing in featured
                snippets, knowledge panels, and other enhanced search results.
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-6 dark:from-orange-950/20 dark:to-red-950/20">
              <h3 className="mb-3 font-semibold text-lg">
                🔗 Cross-Platform Sharing
              </h3>
              <p className="text-sm">
                Different blog posts can be shared across various platforms,
                each optimized for specific audiences and contexts.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 font-semibold text-3xl">Getting Started</h2>
          <p className="mb-6 text-lg leading-relaxed">
            Ready to transform your YouTube content into a powerful blog
            ecosystem? Our AI-powered tool makes it easy to convert your videos
            into multiple, SEO-optimized blog posts that will dramatically
            increase your online discoverability.
          </p>

          <div className="rounded-lg bg-gradient-to-r from-green-600 to-blue-600 p-8 text-center text-white">
            <h3 className="mb-4 font-bold text-2xl">
              Start Your Content Multiplication Journey
            </h3>
            <p className="mb-6 text-lg opacity-90">
              Convert your first YouTube video into multiple blog posts and see
              the difference it makes.
            </p>
            <a
              className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-green-600 transition-colors hover:bg-gray-100"
              href="/"
            >
              Try YouTube to Blog Now
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
