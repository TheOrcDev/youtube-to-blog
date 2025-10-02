export type Subtitle = {
  start: string;
  dur: string;
  text: string;
};

export type YouTubeVideoData = {
  title: string;
  description: string;
  duration: string;
  slug: string;
  author: string;
  captions: Subtitle[];
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/youtube`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to extract YouTube data");
    }

    const videoData = await response.json();
    return videoData;
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
