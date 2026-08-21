import { ImageResponse } from "next/og";
import { Blog } from "@/components/og/blog";
import {
  estimateReadingMinutes,
  excerptFromMarkdown,
  formatPostDate,
} from "@/lib/seo";
import { getPostBySlug } from "@/server/blogs";

export const alt = "Blog post cover";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function OpenGraphImage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      <Blog
        author="YouTube to Blog"
        brand="youtube2blog.com"
        category="Blog"
        excerpt="Turn any video into a ready-to-publish blog post with AI."
        meta="youtube2blog.com"
        title="Post not found"
      />,
      size
    );
  }

  return new ImageResponse(
    <Blog
      author={post.author}
      brand="youtube2blog.com"
      category={
        post.sourceType === "upload" ? "From uploaded video" : "From YouTube"
      }
      excerpt={excerptFromMarkdown(post.content, 120)}
      meta={`${formatPostDate(post.createdAt)} · ${estimateReadingMinutes(post.content)} min read`}
      title={post.title}
    />,
    size
  );
}
