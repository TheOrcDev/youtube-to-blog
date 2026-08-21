const CODE_FENCE_REGEX = /```[\s\S]*?```/g;
const INLINE_CODE_REGEX = /`([^`]*)`/g;
const IMAGE_REGEX = /!\[[^\]]*\]\([^)]*\)/g;
const LINK_REGEX = /\[([^\]]*)\]\([^)]*\)/g;
const HEADING_REGEX = /^#{1,6}\s+/gm;
const EMPHASIS_REGEX = /[*_]{1,3}([^*_]+)[*_]{1,3}/g;
const BLOCKQUOTE_REGEX = /^>\s+/gm;
const LIST_MARKER_REGEX = /^[\s]*[-+*]\s+|^[\s]*\d+\.\s+/gm;
const WHITESPACE_REGEX = /\s+/g;
const WORD_SPLIT_REGEX = /\s+/;

const WORDS_PER_MINUTE = 200;

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(CODE_FENCE_REGEX, " ")
    .replace(IMAGE_REGEX, " ")
    .replace(LINK_REGEX, "$1")
    .replace(INLINE_CODE_REGEX, "$1")
    .replace(HEADING_REGEX, "")
    .replace(EMPHASIS_REGEX, "$1")
    .replace(BLOCKQUOTE_REGEX, "")
    .replace(LIST_MARKER_REGEX, "")
    .replace(WHITESPACE_REGEX, " ")
    .trim();
}

export function excerptFromMarkdown(markdown: string, maxLength = 160): string {
  const text = stripMarkdown(markdown);

  if (text.length <= maxLength) {
    return text;
  }

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");

  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

export function estimateReadingMinutes(markdown: string): number {
  const words = stripMarkdown(markdown).split(WORD_SPLIT_REGEX).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatPostDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
