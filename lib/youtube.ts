import { YoutubeTranscript } from "youtube-transcript";
import { Innertube } from "youtubei.js";

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

// Function to clean YouTube URLs (remove @ prefix and other invalid characters)
export function cleanYouTubeUrl(url: string): string {
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

export async function extractYouTubeData(
  url: string
): Promise<YouTubeVideoData> {
  try {
    // Clean the URL first
    const cleanedUrl = cleanYouTubeUrl(url);

    // Initialize YouTube client
    const yt = await Innertube.create();

    // Extract video ID from cleaned URL
    const videoId = extractVideoId(cleanedUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Get video info
    const info = await yt.getInfo(videoId);
    const videoDetails = info.basic_info;

    // Get transcript
    let transcript = "";
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = transcriptData
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    } catch {
      transcript = "Transcript not available for this video.";
    }

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

export function extractVideoId(url: string): string | null {
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
