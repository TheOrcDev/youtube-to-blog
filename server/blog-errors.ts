export type BlogErrorCode =
  | "AI_GENERATION_FAILED"
  | "AI_NOT_CONFIGURED"
  | "AI_OUTPUT_INVALID"
  | "AUTH_REQUIRED"
  | "BLOG_LOOKUP_FAILED"
  | "BLOG_SAVE_FAILED"
  | "CAPTION_EXTRACTION_FAILED"
  | "CAPTIONS_UNAVAILABLE"
  | "INVALID_YOUTUBE_URL"
  | "UNKNOWN"
  | "VIDEO_NOT_ACCESSIBLE"
  | "YOUTUBE_NOT_CONFIGURED"
  | "YOUTUBE_UNAVAILABLE";

export interface PublicBlogError {
  code: BlogErrorCode;
  message: string;
}

const PUBLIC_ERROR_MESSAGES: Record<BlogErrorCode, string> = {
  AI_GENERATION_FAILED:
    "The blog could not be generated right now. Please try again shortly.",
  AI_NOT_CONFIGURED:
    "Blog generation is temporarily unavailable. Please contact support.",
  AI_OUTPUT_INVALID: "The generated blog was incomplete. Please try again.",
  AUTH_REQUIRED: "Please sign in to create a blog.",
  BLOG_LOOKUP_FAILED:
    "Existing blogs could not be checked right now. Please try again.",
  BLOG_SAVE_FAILED:
    "The blog was generated but could not be saved. Please try again.",
  CAPTION_EXTRACTION_FAILED:
    "YouTube could not provide captions right now. Please try again shortly.",
  CAPTIONS_UNAVAILABLE:
    "This video does not have English captions. Choose a captioned video.",
  INVALID_YOUTUBE_URL: "Enter a valid YouTube video URL.",
  UNKNOWN: "Something went wrong while creating the blog. Please try again.",
  VIDEO_NOT_ACCESSIBLE:
    "This video could not be found or is not publicly accessible.",
  YOUTUBE_NOT_CONFIGURED:
    "YouTube access is not configured. Please contact support.",
  YOUTUBE_UNAVAILABLE:
    "YouTube is temporarily unavailable. Please try again shortly.",
};

export class BlogWorkflowError extends Error {
  readonly code: BlogErrorCode;

  constructor(code: BlogErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = "BlogWorkflowError";
    this.code = code;
  }
}

export function asBlogWorkflowError(
  error: unknown,
  fallbackCode: BlogErrorCode
): BlogWorkflowError {
  if (error instanceof BlogWorkflowError) {
    return error;
  }

  return new BlogWorkflowError(fallbackCode, { cause: error });
}

export function toPublicBlogError(error: unknown): PublicBlogError {
  const code = error instanceof BlogWorkflowError ? error.code : "UNKNOWN";

  return {
    code,
    message: PUBLIC_ERROR_MESSAGES[code],
  };
}

export function getBlogErrorStatus(error: PublicBlogError): number {
  switch (error.code) {
    case "INVALID_YOUTUBE_URL":
      return 400;
    case "AUTH_REQUIRED":
      return 401;
    case "CAPTIONS_UNAVAILABLE":
    case "VIDEO_NOT_ACCESSIBLE":
      return 422;
    case "AI_NOT_CONFIGURED":
    case "YOUTUBE_NOT_CONFIGURED":
      return 503;
    case "AI_GENERATION_FAILED":
    case "AI_OUTPUT_INVALID":
    case "CAPTION_EXTRACTION_FAILED":
    case "YOUTUBE_UNAVAILABLE":
      return 502;
    default:
      return 500;
  }
}
