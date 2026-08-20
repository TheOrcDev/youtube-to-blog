import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Card11 } from "@/components/card-11";
import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { Button } from "@/components/ui/button";
import type { SelectBlog } from "@/db/schema";

interface BlogCardProps {
  blog: SelectBlog;
}

const WORDS = /\s+/;
const WORDS_PER_MINUTE = 200;

function wordCount(content: string): number {
  return content.trim().split(WORDS).filter(Boolean).length;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogCard({ blog }: BlogCardProps) {
  const words = wordCount(blog.content);
  const readingMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  return (
    <Card11
      action={
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={`/blog/${blog.slug}`}>
              <ArrowSquareOutIcon data-icon="inline-start" />
              View article
            </Link>
          </Button>
          <CopyMarkdownButton className="w-full" content={blog.content} />
        </div>
      }
      eyebrow="Article"
      lines={[
        {
          amount: blog.author,
          detail: "Byline",
          id: "author",
          label: "Author",
        },
        {
          amount:
            blog.sourceType === "upload"
              ? blog.originalFilename || "Uploaded video"
              : blog.slug,
          detail: blog.sourceType === "upload" ? "Upload" : "YouTube",
          id: "video",
          label: "Video",
        },
        {
          amount: formatDate(blog.updatedAt),
          detail: "Last edit",
          id: "updated",
          label: "Updated",
        },
      ]}
      meta={`${blog.author} · Issued ${formatDate(blog.createdAt)}`}
      status="Published"
      title={blog.title}
      totalLabel="Reading time"
      totals={[
        {
          id: "words",
          label: "Words",
          value: words.toLocaleString("en-US"),
        },
        {
          id: "created",
          label: "Created",
          value: formatDate(blog.createdAt),
        },
      ]}
      totalValue={`${readingMinutes} min`}
    />
  );
}
