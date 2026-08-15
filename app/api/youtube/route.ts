import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { extractYouTubeData } from "@/server/youtube";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    const videoData = await extractYouTubeData(url);

    return NextResponse.json(videoData);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract YouTube data",
      },
      { status: 500 }
    );
  }
}
