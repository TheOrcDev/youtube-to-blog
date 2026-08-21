import { getSubtitles } from "youtube-caption-extractor";
import { cleanYouTubeUrl, extractVideoId } from "../lib/youtube-url.ts";
import { BlogWorkflowError } from "./blog-errors.ts";

export interface Subtitle {
  dur: string;
  start: string;
  text: string;
}

export interface YouTubeVideoData {
  author: string;
  captions: Subtitle[];
  description: string;
  duration: string;
  slug: string;
  title: string;
}

export type YouTubeVideoMetadata = Omit<YouTubeVideoData, "captions">;

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

type YouTubeMetadataExtractorDependencies = Omit<
  YouTubeExtractorDependencies,
  "getSubtitles"
>;

async function fetchVideoMetadata(
  videoId: string,
  apiKey: string,
  fetchImplementation: typeof fetch
) {
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

  return video;
}

async function resolveCaptions(
  videoId: string,
  getSubtitlesImplementation: typeof getSubtitles
) {
  try {
    const captions = await getSubtitlesImplementation({
      lang: "en",
      videoID: videoId,
    });

    if (captions.length === 0) {
      throw new BlogWorkflowError("CAPTIONS_UNAVAILABLE");
    }

    return captions;
  } catch (error) {
    if (error instanceof BlogWorkflowError) {
      throw error;
    }

    throw new BlogWorkflowError("CAPTION_EXTRACTION_FAILED", { cause: error });
  }
}

export function createYouTubeMetadataExtractor({
  apiKey,
  fetch: fetchImplementation,
}: YouTubeMetadataExtractorDependencies) {
  return async function extractMetadata(
    url: string
  ): Promise<YouTubeVideoMetadata> {
    if (!apiKey) {
      throw new BlogWorkflowError("YOUTUBE_NOT_CONFIGURED");
    }

    const videoId = extractVideoId(cleanYouTubeUrl(url));

    if (!videoId) {
      throw new BlogWorkflowError("INVALID_YOUTUBE_URL");
    }

    const video = await fetchVideoMetadata(
      videoId,
      apiKey,
      fetchImplementation
    );

    return {
      author: video.snippet?.channelTitle || "Unknown Author",
      description: video.snippet?.description || "",
      duration: video.contentDetails?.duration || "PT0S",
      slug: videoId,
      title: video.snippet?.title || "Unknown Title",
    };
  };
}

export function createYouTubeExtractor({
  apiKey,
  fetch: fetchImplementation,
  getSubtitles: getSubtitlesImplementation,
}: YouTubeExtractorDependencies) {
  const extractMetadata = createYouTubeMetadataExtractor({
    apiKey,
    fetch: fetchImplementation,
  });

  return async function extractData(url: string): Promise<YouTubeVideoData> {
    const metadata = await extractMetadata(url);
    const captions = await resolveCaptions(
      metadata.slug,
      getSubtitlesImplementation
    );

    return {
      captions,
      ...metadata,
    };
  };
}

export const extractYouTubeMetadata = createYouTubeMetadataExtractor({
  apiKey: process.env.YOUTUBE_API_KEY,
  fetch,
});

export const extractYouTubeData = createYouTubeExtractor({
  apiKey: process.env.YOUTUBE_API_KEY,
  fetch,
  getSubtitles,
});
