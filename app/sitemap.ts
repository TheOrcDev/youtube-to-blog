import type { MetadataRoute } from "next";
import { getBlogs } from "@/server/blogs";

const fallbackOrigin = "https://www.youtube2blog.com";
const trailingSlashPattern = /\/$/;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = (process.env.NEXT_PUBLIC_APP_URL || fallbackOrigin).replace(
    trailingSlashPattern,
    ""
  );
  const posts = await getBlogs();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      changeFrequency: "weekly",
      priority: 1,
      url: origin,
    },
    {
      changeFrequency: "monthly",
      priority: 0.8,
      url: `${origin}/why`,
    },
    {
      changeFrequency: "monthly",
      priority: 0.6,
      url: `${origin}/docs/api`,
    },
    {
      changeFrequency: "yearly",
      priority: 0.3,
      url: `${origin}/privacy`,
    },
    {
      changeFrequency: "yearly",
      priority: 0.3,
      url: `${origin}/terms`,
    },
  ];

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      changeFrequency: "monthly" as const,
      lastModified: post.updatedAt,
      priority: 0.7,
      url: `${origin}/blog/${encodeURIComponent(post.slug)}`,
    })),
  ];
}
