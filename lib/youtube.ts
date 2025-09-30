import { YoutubeTranscript } from "youtube-transcript";
import { Innertube } from "youtubei.js";

export type YouTubeVideoData = {
  title: string;
  description: string;
  transcript: string;
  duration: string;
  author: string;
};

// Regex patterns for extracting video ID
const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /youtube\.com\/v\/([^&\n?#]+)/,
];

export async function extractYouTubeData(
  url: string
): Promise<YouTubeVideoData> {
  try {
    // Initialize YouTube client
    const yt = await Innertube.create();

    // Extract video ID from URL
    const videoId = extractVideoId(url);
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
    };
  } catch (error) {
    throw new Error(
      `Failed to extract YouTube data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
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
