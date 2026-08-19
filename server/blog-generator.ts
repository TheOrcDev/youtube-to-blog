import { FREE_TIER_MODEL } from "../lib/entitlements/policy.ts";
import { asBlogWorkflowError, BlogWorkflowError } from "./blog-errors.ts";

const MIN_BLOG_LENGTH = 500;
const YOUTUBE_DURATION_REGEX = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

// The model is now chosen per tier by checkGenerationAllowance; this remains
// the default for callers outside the generation flow (e.g. the smoke script).
export const BLOG_GENERATION_MODEL = FREE_TIER_MODEL;

interface VideoData {
  author: string;
  description: string;
  duration: string;
  slug: string;
  title: string;
}

interface CreateBlogInput {
  author: string;
  content: string;
  slug: string;
  title: string;
  userId: string;
}

interface BlogGeneratorDependencies<Blog> {
  checkGenerationAllowance: (userId: string) => Promise<{ model: string }>;
  createBlog: (blog: CreateBlogInput) => Promise<Blog>;
  extractYouTubeMetadata: (youtubeUrl: string) => Promise<VideoData>;
  generateText: (options: {
    messages: Array<{
      content: [
        { data: URL; mediaType: "video/mp4"; type: "file" },
        { text: string; type: "text" },
      ];
      role: "user";
    }>;
    model: string;
  }) => Promise<{ text: string }>;
  getCurrentUser: () => Promise<{ user: { id: string } } | null>;
}

function getDurationMinutes(duration: string): number {
  const match = duration.match(YOUTUBE_DURATION_REGEX);

  if (!match) {
    return 0;
  }

  const hours = Number.parseInt(match[1] || "0", 10);
  const minutes = Number.parseInt(match[2] || "0", 10);
  const seconds = Number.parseInt(match[3] || "0", 10);

  return Math.floor((hours * 3600 + minutes * 60 + seconds) / 60);
}

function createPrompt(videoData: VideoData): string {
  const durationMinutes = getDurationMinutes(videoData.duration);

  return `Generate a high-quality MDX blog post based on the attached YouTube video's audio and visuals.

**Video Information:**
- Title: ${videoData.title}
- Author: ${videoData.author}
- Duration: ${durationMinutes} minutes
- Description: ${videoData.description}

**Objective:** Create a personal, engaging MDX blog post based primarily on the attached public video. Transform its spoken and visual content into a first-person narrative that feels like you're sharing your experience and knowledge directly with the reader.

**Target Audience Detection:** Analyze the video's title, audio, and visuals to automatically determine the appropriate target audience (e.g., developers, designers, marketers, general audience, etc.). Write the blog post for that specific audience.

**Style Guide:**
1. **Content Creation:** Base the blog post on the video's actual content, writing in first person ("I", "my", "me") as if you're personally sharing your experience and knowledge
2. **Structure & Formatting:**
   * Use Markdown for the main structure
   * Format as a single, valid **MDX** file
   * Start with a compelling title (adapt the video title if needed)
   * Use a clear **Introduction** section that explains what you'll be sharing
   * Organize content using level-2 headings ('##') for major sections and level-3 headings ('###') for sub-points
   * End with a **Conclusion** that summarizes your key takeaways
3. **Code Inclusion:** Include relevant code examples mentioned in the transcript, presented as your own examples
4. **Educational Value:** Ensure the content provides educational value by sharing your insights and experiences
5. **Personal Tone:** Write in a conversational, personal tone - like you're talking to a friend or colleague about what you learned
6. **Transcription Fidelity:** Stay true to the original content while making it sound personal and authentic

**Output Format:** Complete, ready-to-publish MDX content starting with the title and ending with the conclusion. NO frontmatter (YAML metadata with --- markers).`;
}

export function createBlogGenerator<Blog>({
  checkGenerationAllowance,
  createBlog,
  extractYouTubeMetadata,
  generateText,
  getCurrentUser,
}: BlogGeneratorDependencies<Blog>) {
  return async function generateBlog(youtubeUrl: string): Promise<Blog> {
    let currentUser: { user: { id: string } } | null;

    try {
      currentUser = await getCurrentUser();
    } catch (error) {
      throw new BlogWorkflowError("AUTH_REQUIRED", { cause: error });
    }

    if (!currentUser) {
      throw new BlogWorkflowError("AUTH_REQUIRED");
    }

    let allowance: { model: string };

    try {
      allowance = await checkGenerationAllowance(currentUser.user.id);
    } catch (error) {
      throw asBlogWorkflowError(error, "UNKNOWN");
    }

    let videoData: VideoData;

    try {
      videoData = await extractYouTubeMetadata(youtubeUrl);
    } catch (error) {
      throw asBlogWorkflowError(error, "YOUTUBE_UNAVAILABLE");
    }

    let text: string;

    try {
      ({ text } = await generateText({
        messages: [
          {
            content: [
              {
                data: new URL(
                  `https://www.youtube.com/watch?v=${videoData.slug}`
                ),
                mediaType: "video/mp4",
                type: "file",
              },
              { text: createPrompt(videoData), type: "text" },
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

    try {
      return await createBlog({
        author: videoData.author,
        content: text,
        slug: videoData.slug,
        title: videoData.title,
        userId: currentUser.user.id,
      });
    } catch (error) {
      throw new BlogWorkflowError("BLOG_SAVE_FAILED", { cause: error });
    }
  };
}
