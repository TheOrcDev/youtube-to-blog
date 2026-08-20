import {
  MAX_UPLOAD_BYTES,
  SUPPORTED_UPLOAD_TYPES,
} from "../lib/entitlements/policy.ts";
import { asBlogWorkflowError, BlogWorkflowError } from "./blog-errors.ts";

const MIN_BLOG_LENGTH = 500;
const MAX_SLUG_BASE_LENGTH = 60;
const TITLE_HEADING_REGEX = /^#\s+(.+)$/m;
const NON_SLUG_CHARS_REGEX = /[^a-z0-9]+/g;
const EDGE_DASHES_REGEX = /^-+|-+$/g;
const FILE_EXTENSION_REGEX = /\.[^.]+$/;

export type SupportedUploadType = (typeof SUPPORTED_UPLOAD_TYPES)[number];

export function isSupportedUploadType(
  value: string
): value is SupportedUploadType {
  return (SUPPORTED_UPLOAD_TYPES as readonly string[]).includes(value);
}

export interface UploadBlogInput {
  filename: string;
  mediaType: string;
  uploadUrl: string;
}

interface CreateUploadBlogRecord {
  author: string;
  content: string;
  originalFilename: string;
  slug: string;
  sourceType: "upload";
  title: string;
  userId: string;
}

interface UploadBlogGeneratorDependencies<Blog> {
  checkGenerationAllowance: (
    userId: string,
    email?: string | null
  ) => Promise<{ model: string }>;
  checkUploadAllowance: (
    userId: string,
    email?: string | null
  ) => Promise<void>;
  createBlog: (blog: CreateUploadBlogRecord) => Promise<Blog>;
  deleteUpload: (url: string) => Promise<void>;
  fetchUploadBytes: (url: string) => Promise<Uint8Array>;
  generateText: (options: {
    messages: Array<{
      content: [
        { data: Uint8Array; mediaType: SupportedUploadType; type: "file" },
        { text: string; type: "text" },
      ];
      role: "user";
    }>;
    model: string;
  }) => Promise<{ text: string }>;
  getCurrentUser: () => Promise<{
    user: { email?: string | null; id: string; name?: string | null };
  } | null>;
  randomSlugSuffix?: () => string;
}

function defaultRandomSlugSuffix(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function humanizeFilename(filename: string): string {
  const withoutExtension = filename.replace(FILE_EXTENSION_REGEX, "");
  const spaced = withoutExtension.replace(/[-_]+/g, " ").trim();

  return spaced || "Uploaded video";
}

export function extractBlogTitle(content: string, filename: string): string {
  const match = content.match(TITLE_HEADING_REGEX);
  const heading = match?.[1]?.replace(/[*_`]/g, "").trim();

  return heading || humanizeFilename(filename);
}

export function slugifyTitle(title: string, suffix: string): string {
  const base = title
    .toLowerCase()
    .replace(NON_SLUG_CHARS_REGEX, "-")
    .replace(EDGE_DASHES_REGEX, "")
    .slice(0, MAX_SLUG_BASE_LENGTH)
    .replace(EDGE_DASHES_REGEX, "");

  return base ? `${base}-${suffix}` : suffix;
}

export function createUploadPrompt(filename: string): string {
  return `Generate a high-quality MDX blog post based on the attached video's audio and visuals.

**Video Information:**
- Original filename: ${filename}

**Objective:** Create a personal, engaging MDX blog post based primarily on the attached video. Transform its spoken and visual content into a first-person narrative that feels like you're sharing your experience and knowledge directly with the reader.

**Target Audience Detection:** Analyze the video's audio and visuals to automatically determine the appropriate target audience (e.g., developers, designers, marketers, general audience, etc.). Write the blog post for that specific audience.

**Style Guide:**
1. **Content Creation:** Base the blog post on the video's actual content, writing in first person ("I", "my", "me") as if you're personally sharing your experience and knowledge
2. **Structure & Formatting:**
   * Use Markdown for the main structure
   * Format as a single, valid **MDX** file
   * Start with a compelling title as a level-1 heading ('# Title') on the first line
   * Use a clear **Introduction** section that explains what you'll be sharing
   * Organize content using level-2 headings ('##') for major sections and level-3 headings ('###') for sub-points
   * End with a **Conclusion** that summarizes your key takeaways
3. **Code Inclusion:** Include relevant code examples shown or mentioned in the video, presented as your own examples
4. **Educational Value:** Ensure the content provides educational value by sharing your insights and experiences
5. **Personal Tone:** Write in a conversational, personal tone - like you're talking to a friend or colleague about what you learned
6. **Content Fidelity:** Stay true to the original content while making it sound personal and authentic

**Output Format:** Complete, ready-to-publish MDX content starting with the title and ending with the conclusion. NO frontmatter (YAML metadata with --- markers).`;
}

interface UploadUser {
  user: { email?: string | null; id: string; name?: string | null };
}

async function resolveCurrentUser(
  getCurrentUser: () => Promise<UploadUser | null>
): Promise<UploadUser> {
  let currentUser: UploadUser | null;

  try {
    currentUser = await getCurrentUser();
  } catch (error) {
    throw new BlogWorkflowError("AUTH_REQUIRED", { cause: error });
  }

  if (!currentUser) {
    throw new BlogWorkflowError("AUTH_REQUIRED");
  }

  return currentUser;
}

async function loadUploadBytes(
  fetchUploadBytes: (url: string) => Promise<Uint8Array>,
  uploadUrl: string
): Promise<Uint8Array> {
  let bytes: Uint8Array;

  try {
    bytes = await fetchUploadBytes(uploadUrl);
  } catch (error) {
    throw new BlogWorkflowError("UPLOAD_FETCH_FAILED", { cause: error });
  }

  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new BlogWorkflowError("UPLOAD_TOO_LARGE");
  }

  return bytes;
}

export function createUploadBlogGenerator<Blog>({
  checkGenerationAllowance,
  checkUploadAllowance,
  createBlog,
  deleteUpload,
  fetchUploadBytes,
  generateText,
  getCurrentUser,
  randomSlugSuffix = defaultRandomSlugSuffix,
}: UploadBlogGeneratorDependencies<Blog>) {
  async function runGeneration(
    currentUser: UploadUser,
    {
      filename,
      mediaType,
      uploadUrl,
    }: UploadBlogInput & {
      mediaType: SupportedUploadType;
    }
  ): Promise<Blog> {
    await checkUploadAllowance(currentUser.user.id, currentUser.user.email);

    let allowance: { model: string };

    try {
      allowance = await checkGenerationAllowance(
        currentUser.user.id,
        currentUser.user.email
      );
    } catch (error) {
      throw asBlogWorkflowError(error, "UNKNOWN");
    }

    const bytes = await loadUploadBytes(fetchUploadBytes, uploadUrl);

    let text: string;

    try {
      ({ text } = await generateText({
        messages: [
          {
            content: [
              { data: bytes, mediaType, type: "file" },
              { text: createUploadPrompt(filename), type: "text" },
            ],
            role: "user",
          },
        ],
        model: allowance.model,
      }));
    } catch (error) {
      throw new BlogWorkflowError("AI_GENERATION_FAILED", { cause: error });
    }

    if (!text || text.length < MIN_BLOG_LENGTH) {
      throw new BlogWorkflowError("AI_OUTPUT_INVALID");
    }

    const title = extractBlogTitle(text, filename);
    const slug = slugifyTitle(title, randomSlugSuffix());

    try {
      return await createBlog({
        author: currentUser.user.name || "You",
        content: text,
        originalFilename: filename,
        slug,
        sourceType: "upload",
        title,
        userId: currentUser.user.id,
      });
    } catch (error) {
      throw new BlogWorkflowError("BLOG_SAVE_FAILED", { cause: error });
    }
  }

  return async function generateBlogFromUpload(
    input: UploadBlogInput
  ): Promise<Blog> {
    if (!isSupportedUploadType(input.mediaType)) {
      throw new BlogWorkflowError("UPLOAD_UNSUPPORTED_FORMAT");
    }

    const currentUser = await resolveCurrentUser(getCurrentUser);

    try {
      return await runGeneration(currentUser, {
        ...input,
        mediaType: input.mediaType,
      });
    } finally {
      // The blog text is the durable artifact; the uploaded video is deleted
      // whether generation succeeded or failed. Best-effort: a leaked blob
      // must never mask the real outcome.
      await deleteUpload(input.uploadUrl).catch(() => {
        // Cleanup failures must never mask the real outcome.
      });
    }
  };
}
