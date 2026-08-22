import type { Metadata } from "next";
import Link from "next/link";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import {
  DocsOnThisPage,
  type DocsSection,
} from "@/components/docs/docs-on-this-page";
import {
  API_MAX_KEYS_PER_USER,
  API_RATE_LIMIT_PER_MINUTE,
} from "@/lib/entitlements/policy";
import {
  MAX_STYLE_INSTRUCTIONS_LENGTH,
  WRITING_STYLES,
} from "@/lib/writing-styles";

const BASE_URL = "https://www.youtube2blog.com";

const DOCS_SECTIONS: readonly DocsSection[] = [
  { href: "#authentication", label: "Authentication" },
  { href: "#create-blog", label: "Create a blog post" },
  { href: "#list-blogs", label: "List blog posts" },
  { href: "#get-blog", label: "Get a blog post" },
  { href: "#errors", label: "Errors" },
  { href: "#limits", label: "Rate limits & quotas" },
] as const;

const AUTH_EXAMPLE = `curl ${BASE_URL}/api/v1/blogs \\
  -H "Authorization: Bearer ytb_your_api_key"`;

const CREATE_EXAMPLE = `curl -X POST ${BASE_URL}/api/v1/blogs \\
  -H "Authorization: Bearer ytb_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'`;

const STYLE_EXAMPLE = `curl -X POST ${BASE_URL}/api/v1/blogs \\
  -H "Authorization: Bearer ytb_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "style": "technical",
    "styleInstructions": "Short sentences. Address the reader as you. Never use emoji."
  }'`;

const CREATE_RESPONSE = `{
  "status": "created",
  "blog": {
    "slug": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up: A Deep Dive",
    "author": "Rick Astley",
    "sourceType": "youtube",
    "createdAt": "2026-08-21T09:30:00.000Z",
    "content": "# Never Gonna Give You Up: A Deep Dive\\n\\n...",
    "url": "${BASE_URL}/blog/dQw4w9WgXcQ"
  }
}`;

const LIST_EXAMPLE = `curl "${BASE_URL}/api/v1/blogs?limit=10&offset=0" \\
  -H "Authorization: Bearer ytb_your_api_key"`;

const LIST_RESPONSE = `{
  "blogs": [
    {
      "slug": "dQw4w9WgXcQ",
      "title": "Never Gonna Give You Up: A Deep Dive",
      "author": "Rick Astley",
      "sourceType": "youtube",
      "createdAt": "2026-08-21T09:30:00.000Z",
      "url": "${BASE_URL}/blog/dQw4w9WgXcQ"
    }
  ],
  "pagination": { "limit": 10, "offset": 0 }
}`;

const GET_EXAMPLE = `curl ${BASE_URL}/api/v1/blogs/dQw4w9WgXcQ \\
  -H "Authorization: Bearer ytb_your_api_key"`;

const ERROR_RESPONSE = `{
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "You have used all of this month's blog generations. Upgrade to Pro for a higher limit."
  }
}`;

const ERROR_CODES = [
  {
    code: "MISSING_API_KEY",
    description:
      "No API key was sent. Use the Authorization or x-api-key header.",
    status: "401",
  },
  {
    code: "INVALID_API_KEY",
    description: "The key does not exist, is disabled, or has expired.",
    status: "401",
  },
  {
    code: "API_REQUIRES_PRO",
    description: "The account that owns this key is no longer on the Pro plan.",
    status: "402",
  },
  {
    code: "QUOTA_EXCEEDED",
    description: "The monthly generation quota has been used up.",
    status: "402",
  },
  {
    code: "INVALID_REQUEST",
    description: "The request body is not valid JSON or is missing youtubeUrl.",
    status: "400",
  },
  {
    code: "STYLE_REQUIRES_PRO",
    description:
      "styleInstructions was sent but the account is no longer on the Pro plan.",
    status: "402",
  },
  {
    code: "INVALID_YOUTUBE_URL",
    description: "The URL is not a valid YouTube video URL.",
    status: "400",
  },
  {
    code: "BLOG_NOT_FOUND",
    description: "No blog post exists with the requested slug.",
    status: "404",
  },
  {
    code: "VIDEO_NOT_ACCESSIBLE",
    description: "The video is private, deleted, or otherwise unavailable.",
    status: "422",
  },
  {
    code: "RATE_LIMITED",
    description: `The key exceeded ${API_RATE_LIMIT_PER_MINUTE} requests per minute.`,
    status: "429",
  },
  {
    code: "AI_GENERATION_FAILED",
    description: "Generation failed upstream. Retry the request shortly.",
    status: "502",
  },
] as const;

export const metadata: Metadata = {
  alternates: {
    canonical: "/docs/api",
  },
  description:
    "Generate blog posts from YouTube videos programmatically. REST API reference: authentication, endpoints, errors, and rate limits.",
  openGraph: {
    description:
      "Generate blog posts from YouTube videos programmatically. REST API reference: authentication, endpoints, errors, and rate limits.",
    title: "API documentation - YouTube to Blog",
    url: "/docs/api",
  },
  title: "API documentation",
};

export default function ApiDocsPage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
      <aside className="hidden lg:block">
        <DocsOnThisPage sections={DOCS_SECTIONS} />
      </aside>

      <article className="min-w-0 max-w-3xl pb-20 [&_section[id]]:scroll-mt-24">
        <header>
          <p className="font-mono text-muted-foreground text-sm">
            API documentation
          </p>
          <h1 className="mt-2 font-bold text-4xl tracking-tight">
            YouTube to Blog API
          </h1>
          <p className="mt-4 text-muted-foreground leading-7">
            Turn YouTube videos into publish-ready blog posts from your own
            scripts, pipelines, and apps. The API is available on the{" "}
            <Link className="underline underline-offset-4" href="/pricing">
              Pro plan
            </Link>{" "}
            and shares your account&apos;s monthly generation quota with the web
            app.
          </p>
          <DocsCodeBlock code={`${BASE_URL}/api/v1`} label="Base URL" />
        </header>

        <section className="mt-12" id="authentication">
          <h2 className="font-semibold text-2xl tracking-tight">
            Authentication
          </h2>
          <p className="mt-3 text-muted-foreground leading-7">
            Create an API key in{" "}
            <Link
              className="underline underline-offset-4"
              href="/dashboard/api-keys"
            >
              the dashboard
            </Link>
            . Keys start with <code className="font-mono">ytb_</code> and are
            shown once at creation - store them somewhere safe. You can have up
            to {API_MAX_KEYS_PER_USER} active keys and revoke any of them at any
            time.
          </p>
          <p className="mt-3 text-muted-foreground leading-7">
            Send the key with every request, either as a bearer token or in the{" "}
            <code className="font-mono">x-api-key</code> header.
          </p>
          <DocsCodeBlock code={AUTH_EXAMPLE} label="Authenticated request" />
        </section>

        <section className="mt-12" id="create-blog">
          <h2 className="font-semibold text-2xl tracking-tight">
            Create a blog post
          </h2>
          <DocsCodeBlock code="POST /api/v1/blogs" label="Endpoint" />
          <p className="mt-3 text-muted-foreground leading-7">
            Converts a YouTube video into a Markdown blog post. The request is
            synchronous: the connection stays open while the AI writes the post,
            which typically takes 20–60 seconds and can take a few minutes for
            long videos. Set your HTTP client timeout accordingly.
          </p>
          <DocsCodeBlock code={CREATE_EXAMPLE} label="Request" />
          <p className="mt-3 text-muted-foreground leading-7">
            A new post returns <code className="font-mono">201</code> with{" "}
            <code className="font-mono">status: &quot;created&quot;</code>. If a
            post for that video already exists, the API returns it with{" "}
            <code className="font-mono">200</code> and{" "}
            <code className="font-mono">status: &quot;existing&quot;</code>{" "}
            without using any of your quota.
          </p>
          <DocsCodeBlock code={CREATE_RESPONSE} label="Response 201" />
          <p className="mt-3 text-muted-foreground leading-7">
            The <code className="font-mono">content</code> field contains the
            complete post as Markdown, ready to publish anywhere.
          </p>
          <h3 className="mt-8 font-semibold text-lg tracking-tight">
            Writing style
          </h3>
          <p className="mt-3 text-muted-foreground leading-7">
            Two optional fields control the voice of the generated post. When
            omitted, the account&apos;s saved writing style from{" "}
            <Link
              className="underline underline-offset-4"
              href="/dashboard/settings"
            >
              settings
            </Link>{" "}
            is used.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground leading-7">
            <li>
              <code className="font-mono">style</code> - one of{" "}
              {WRITING_STYLES.map((style, index) => (
                <span key={style.id}>
                  {index > 0 ? ", " : null}
                  <code className="font-mono">{style.id}</code>
                </span>
              ))}
              .
            </li>
            <li>
              <code className="font-mono">styleInstructions</code> - free-text
              voice notes (up to {MAX_STYLE_INSTRUCTIONS_LENGTH} characters)
              applied on top of the selected style.
            </li>
          </ul>
          <DocsCodeBlock code={STYLE_EXAMPLE} label="Request with style" />
        </section>

        <section className="mt-12" id="list-blogs">
          <h2 className="font-semibold text-2xl tracking-tight">
            List blog posts
          </h2>
          <DocsCodeBlock code="GET /api/v1/blogs" label="Endpoint" />
          <p className="mt-3 text-muted-foreground leading-7">
            Returns your blog posts, newest first, without the Markdown body.
            Use <code className="font-mono">limit</code> (1–100, default 20) and{" "}
            <code className="font-mono">offset</code> (default 0) to paginate.
          </p>
          <DocsCodeBlock code={LIST_EXAMPLE} label="Request" />
          <DocsCodeBlock code={LIST_RESPONSE} label="Response 200" />
        </section>

        <section className="mt-12" id="get-blog">
          <h2 className="font-semibold text-2xl tracking-tight">
            Get a blog post
          </h2>
          <DocsCodeBlock code="GET /api/v1/blogs/{slug}" label="Endpoint" />
          <p className="mt-3 text-muted-foreground leading-7">
            Fetches a single post, including the full Markdown content. The{" "}
            <code className="font-mono">slug</code> is returned by the create
            and list endpoints.
          </p>
          <DocsCodeBlock code={GET_EXAMPLE} label="Request" />
        </section>

        <section className="mt-12" id="errors">
          <h2 className="font-semibold text-2xl tracking-tight">Errors</h2>
          <p className="mt-3 text-muted-foreground leading-7">
            Every error response has the same shape: an{" "}
            <code className="font-mono">error</code> object with a stable{" "}
            <code className="font-mono">code</code> for your code to branch on
            and a human-readable <code className="font-mono">message</code>.
          </p>
          <DocsCodeBlock code={ERROR_RESPONSE} label="Error response" />
          <dl className="mt-5 border-y">
            {ERROR_CODES.map(({ code, description, status }) => (
              <div
                className="grid gap-2 border-b py-4 last:border-b-0 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6"
                key={code}
              >
                <dt className="flex items-baseline gap-2">
                  <code className="break-words font-mono text-sm">{code}</code>
                  <span className="font-mono text-muted-foreground text-xs">
                    {status}
                  </span>
                </dt>
                <dd className="text-muted-foreground text-sm leading-6">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12" id="limits">
          <h2 className="font-semibold text-2xl tracking-tight">
            Rate limits &amp; quotas
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground leading-7">
            <li>
              Each API key allows {API_RATE_LIMIT_PER_MINUTE} requests per
              minute. Exceeding it returns{" "}
              <code className="font-mono">429 RATE_LIMITED</code>; wait for the
              window to reset and retry.
            </li>
            <li>
              Blog generation counts against your account&apos;s monthly
              generation quota - the same quota the web app uses. When it runs
              out, <code className="font-mono">POST /api/v1/blogs</code> returns{" "}
              <code className="font-mono">402 QUOTA_EXCEEDED</code>.
            </li>
            <li>
              Listing and reading posts never consume quota, and neither does
              creating a post for a video that has already been converted.
            </li>
            <li>
              You can hold up to {API_MAX_KEYS_PER_USER} API keys per account.
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}
