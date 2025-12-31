import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSubtitles } from "youtube-caption-extractor";

export interface Subtitle {
  start: string;
  dur: string;
  text: string;
}

export interface YouTubeVideoData {
  title: string;
  description: string;
  duration: string;
  slug: string;
  author: string;
  captions: Subtitle[];
}

// Regex patterns for extracting video ID
const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /youtube\.com\/v\/([^&\n?#]+)/,
];

// Regex to remove @ prefix from URLs
const AT_PREFIX_REGEX = /^@+/;

// Function to clean YouTube URLs (remove @ prefix and other invalid characters)
function cleanYouTubeUrl(url: string): string {
  // Remove @ prefix if present
  let cleanedUrl = url.replace(AT_PREFIX_REGEX, "");

  // Ensure it starts with http:// or https://
  const hasProtocol =
    cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://");
  if (!hasProtocol) {
    cleanedUrl = `https://${cleanedUrl}`;
  }

  return cleanedUrl;
}

function extractVideoId(url: string): string | null {
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

async function getVideoInfoFromYouTubeAPI(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "YouTube API key is not configured. Please set YOUTUBE_API_KEY environment variable."
    );
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(
      `YouTube API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found or not accessible");
  }

  const video = data.items[0];
  const snippet = video.snippet;
  const contentDetails = video.contentDetails;

  return {
    title: snippet.title,
    description: snippet.description,
    channelTitle: snippet.channelTitle,
    duration: contentDetails.duration,
  };
}

async function getVideoCaptions(videoId: string): Promise<Subtitle[]> {
  try {
    const captions = await getSubtitles({ videoID: videoId, lang: "en" });
    return captions;
  } catch (error) {
    // If captions are not available, throw an error
    throw new Error(
      `No captions available for this video. This video must have captions (auto-generated or manual) to generate a blog post. Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function extractYouTubeData(url: string): Promise<YouTubeVideoData> {
  try {
    // Clean the URL first
    const cleanedUrl = cleanYouTubeUrl(url);

    // Extract video ID from cleaned URL
    const videoId = extractVideoId(cleanedUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Get video info from YouTube Data API v3
    const videoInfo = await getVideoInfoFromYouTubeAPI(videoId);

    // Get captions - this is required for blog generation
    const captions = await getVideoCaptions(videoId);

    return {
      title: videoInfo.title || "Unknown Title",
      description: videoInfo.description || "",
      duration: videoInfo.duration || "PT0S",
      author: videoInfo.channelTitle || "Unknown Author",
      slug: videoId,
      captions,
    };
  } catch (error) {
    throw new Error(
      `Failed to extract YouTube data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

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
