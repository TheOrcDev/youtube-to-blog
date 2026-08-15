import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getBlogErrorStatus, toPublicBlogError } from "@/server/blog-errors";
import { extractYouTubeData } from "@/server/youtube";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_YOUTUBE_URL",
            message: "Enter a valid YouTube video URL.",
          },
        },
        { status: 400 }
      );
    }

    const videoData = await extractYouTubeData(url);

    return NextResponse.json(videoData);
  } catch (error) {
    const publicError = toPublicBlogError(error);

    return NextResponse.json(
      { error: publicError },
      { status: getBlogErrorStatus(publicError) }
    );
  }
}
