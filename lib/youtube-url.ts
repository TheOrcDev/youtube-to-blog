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
