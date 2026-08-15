import { getSubtitles } from "youtube-caption-extractor";
import { BlogWorkflowError } from "./blog-errors.ts";

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

interface YouTubeApiResponse {
  items?: Array<{
    contentDetails?: { duration?: string };
    snippet?: {
      channelTitle?: string;
      description?: string;
      title?: string;
    };
  }>;
}

interface YouTubeExtractorDependencies {
  apiKey?: string;
  fetch: typeof fetch;
  getSubtitles: typeof getSubtitles;
}

const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /youtube\.com\/v\/([^&\n?#]+)/,
];

const AT_PREFIX_REGEX = /^@+/;

export function cleanYouTubeUrl(url: string): string {
  let cleanedUrl = url.replace(AT_PREFIX_REGEX, "");
  const hasProtocol =
    cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://");

  if (!hasProtocol) {
    cleanedUrl = `https://${cleanedUrl}`;
  }

  return cleanedUrl;
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

export function createYouTubeExtractor({
  apiKey,
  fetch: fetchImplementation,
  getSubtitles: getSubtitlesImplementation,
}: YouTubeExtractorDependencies) {
  return async function extractYouTubeData(
    url: string
  ): Promise<YouTubeVideoData> {
    if (!apiKey) {
      throw new BlogWorkflowError("YOUTUBE_NOT_CONFIGURED");
    }

    const videoId = extractVideoId(cleanYouTubeUrl(url));

    if (!videoId) {
      throw new BlogWorkflowError("INVALID_YOUTUBE_URL");
    }

    let response: Response;

    try {
      response = await fetchImplementation(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
      );
    } catch (error) {
      throw new BlogWorkflowError("YOUTUBE_UNAVAILABLE", { cause: error });
    }

    if (!response.ok) {
      throw new BlogWorkflowError("YOUTUBE_UNAVAILABLE");
    }

    let data: YouTubeApiResponse;

    try {
      data = (await response.json()) as YouTubeApiResponse;
    } catch (error) {
      throw new BlogWorkflowError("YOUTUBE_UNAVAILABLE", { cause: error });
    }

    const video = data.items?.[0];

    if (!video) {
      throw new BlogWorkflowError("VIDEO_NOT_ACCESSIBLE");
    }

    let captions: Subtitle[];

    try {
      captions = await getSubtitlesImplementation({
        lang: "en",
        videoID: videoId,
      });
    } catch (error) {
      throw new BlogWorkflowError("CAPTION_EXTRACTION_FAILED", {
        cause: error,
      });
    }

    if (captions.length === 0) {
      throw new BlogWorkflowError("CAPTIONS_UNAVAILABLE");
    }

    return {
      author: video.snippet?.channelTitle || "Unknown Author",
      captions,
      description: video.snippet?.description || "",
      duration: video.contentDetails?.duration || "PT0S",
      slug: videoId,
      title: video.snippet?.title || "Unknown Title",
    };
  };
}

export const extractYouTubeData = createYouTubeExtractor({
  apiKey: process.env.YOUTUBE_API_KEY,
  fetch,
  getSubtitles,
});
