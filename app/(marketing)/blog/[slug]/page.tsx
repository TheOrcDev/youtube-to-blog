"use cache";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { PostHeader } from "@/components/post-header";
import markdownToHtml from "@/lib/markdown-to-html";
import { getBlogs, getPostBySlug } from "@/server/blogs";
import markdownStyles from "./markdown-styles.module.css";

export default async function Post(props: Params) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <main className="py-8">
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

  return {
    openGraph: {
      title,
    },
    title,
  };
}

export async function generateStaticParams() {
  const posts = await getBlogs();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
