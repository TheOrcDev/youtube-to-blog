import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { Innertube } from "youtubei.js";

export const runtime = "nodejs";

export type YouTubeVideoData = {
  title: string;
  description: string;
  transcript: string;
  duration: string;
  slug: string;
  author: string;
};

// Regex patterns for extracting video ID
const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /youtube\.com\/v\/([^&\n?#]+)/,
];

// Regex to remove @ prefix from URLs
const AT_PREFIX_REGEX = /^@+/;

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Global YouTube client cache to avoid re-fetching player script
let ytClient: Innertube | null = null;

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

async function initializeYouTubeClient(): Promise<Innertube> {
  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      return await Innertube.create({
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...init?.headers,
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            },
          }),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("signature decipher algorithm") &&
        retries > 1
      ) {
        retries--;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed to initialize YouTube client after retries");
}

async function getYouTubeClient(): Promise<Innertube> {
  if (!ytClient) {
    ytClient = await initializeYouTubeClient();
  }
  return ytClient;
}

async function getVideoInfo(yt: Innertube, videoId: string) {
  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      return await yt.getInfo(videoId);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("signature decipher algorithm") &&
        retries > 1
      ) {
        retries--;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed to get video info after retries");
}

async function getTranscript(videoId: string): Promise<string> {
  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    return transcriptData
      .map((item) => item.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "Transcript not available for this video.";
  }
}

async function extractYouTubeData(url: string): Promise<YouTubeVideoData> {
  try {
    // Clean the URL first
    const cleanedUrl = cleanYouTubeUrl(url);

    // Get cached YouTube client
    const yt = await getYouTubeClient();

    // Extract video ID from cleaned URL
    const videoId = extractVideoId(cleanedUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Get video info
    const info = await getVideoInfo(yt, videoId);
    const videoDetails = info.basic_info;

    // Get transcript
    const transcript = await getTranscript(videoId);

    return {
      title: videoDetails.title || "Unknown Title",
      description: videoDetails.short_description || "",
      transcript,
      duration: videoDetails.duration?.toString() || "0",
      author: videoDetails.author || "Unknown Author",
      slug: videoId,
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
