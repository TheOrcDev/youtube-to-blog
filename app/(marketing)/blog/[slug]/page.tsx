"use cache";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { PostHeader } from "@/components/post-header";
import { getAppUrl } from "@/lib/app-url";
import markdownToHtml from "@/lib/markdown-to-html";
import { excerptFromMarkdown } from "@/lib/seo";
import { getBlogs, getPostBySlug } from "@/server/blogs";
import markdownStyles from "./markdown-styles.module.css";

export default async function Post(props: Params) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    author: { "@type": "Person", name: post.author },
    dateModified: post.updatedAt.toISOString(),
    datePublished: post.createdAt.toISOString(),
    description: excerptFromMarkdown(post.content || "", 160),
    headline: post.title,
    mainEntityOfPage: `${getAppUrl()}/blog/${post.slug}`,
    publisher: { "@type": "Organization", name: "YouTube to Blog" },
  };

  return (
    <main className="py-8">
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is built from our own data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        type="application/ld+json"
      />
      <div className="container mx-auto px-5">
        <article className="mb-32">
          <PostHeader
            author={post.author}
            date={post.createdAt.toLocaleDateString()}
            title={post.title}
          />
          <div className="mx-auto mb-8 flex max-w-2xl justify-end">
            <CopyMarkdownButton content={post.content || ""} />
          </div>
          <div className="mx-auto max-w-2xl">
            <div
              className={markdownStyles.markdown}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: This is safe
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | ${post.author}`;
  const description = excerptFromMarkdown(post.content || "", 160);

  return {
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    authors: [{ name: post.author }],
    description,
    openGraph: {
      authors: [post.author],
      description,
      publishedTime: post.createdAt.toISOString(),
      title,
      type: "article",
      url: `/blog/${post.slug}`,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      title,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getBlogs();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
