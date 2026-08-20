import { NextResponse } from "next/server";

import { authenticateApiRequest } from "@/server/api-auth";
import { serializeBlog } from "@/server/api-blog";
import { getPostBySlug } from "@/server/blogs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const authResult = await authenticateApiRequest(request);

  if (!authResult.ok) {
    return NextResponse.json(authResult.body, { status: authResult.status });
  }

  const { slug } = await params;
  // Blog pages are public at /blog/[slug], so the API mirrors that: any valid
  // key can read any post, matching the "existing" dedup behavior on POST.
  const blog = await getPostBySlug(slug);

  if (!blog) {
    return NextResponse.json(
      {
        error: {
          code: "BLOG_NOT_FOUND",
          message: "No blog post exists with this slug.",
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    blog: serializeBlog(blog, { includeContent: true }),
  });
}
