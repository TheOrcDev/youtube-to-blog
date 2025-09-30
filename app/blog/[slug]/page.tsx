import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostHeader } from "@/components/post-header";
import { Button } from "@/components/ui/button";
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
    <main className="pt-30">
      <Button asChild className="absolute top-4 left-4" variant="outline">
        <Link href="/">Back</Link>
      </Button>
      <div className="container mx-auto px-5">
        <article className="mb-32">
          <PostHeader
            author="OrcDev"
            date={post.createdAt.toLocaleDateString()}
            title={post.title}
          />
          <div className="mx-auto max-w-2xl">
            <div
              className={markdownStyles.markdown}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | OrcDev`;

  return {
    title,
    openGraph: {
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
