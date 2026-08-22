import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { Blog } from "@/components/og/blog";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/og";
import {
  estimateReadingMinutes,
  excerptFromMarkdown,
  formatPostDate,
} from "@/lib/seo";
import { getPostBySlug } from "@/server/blogs";

const size = { height: OG_IMAGE_HEIGHT, width: OG_IMAGE_WIDTH };

async function siteLogoSrc() {
  const bytes = await readFile(
    join(process.cwd(), "public/youtube-to-blog-logo.png")
  );

  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const [post, logo] = await Promise.all([getPostBySlug(slug), siteLogoSrc()]);

  if (!post) {
    return new ImageResponse(
      <Blog
        author="YouTube to Blog"
        brand="youtube2blog.com"
        category="Blog"
        excerpt="Turn any video into a ready-to-publish blog post with AI."
        logo={logo}
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
      logo={logo}
      meta={`${formatPostDate(post.createdAt)} · ${estimateReadingMinutes(post.content)} min read`}
      title={post.title}
    />,
    size
  );
}
