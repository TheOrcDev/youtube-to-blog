import { asBlogWorkflowError, BlogWorkflowError } from "./blog-errors.ts";

const MIN_BLOG_LENGTH = 500;
const MAX_CAPTION_LENGTH = 8000;
const YOUTUBE_DURATION_REGEX = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

export const BLOG_GENERATION_MODEL = "google/gemini-2.5-flash";

interface Caption {
  start: string;
  dur: string;
  text: string;
}

interface VideoData {
  author: string;
  captions: Caption[];
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
  createBlog: (blog: CreateBlogInput) => Promise<Blog>;
  extractYouTubeData: (youtubeUrl: string) => Promise<VideoData>;
  generateText: (options: {
    model: string;
    prompt: string;
  }) => Promise<{ text: string }>;
  getCurrentUser: () => Promise<{ user: { id: string } } | null>;
}

function formatCaptionsForPrompt(captions: Caption[]): string {
  const fullText = captions.map((caption) => caption.text).join(" ");

  if (fullText.length > MAX_CAPTION_LENGTH) {
    return `${fullText.substring(0, MAX_CAPTION_LENGTH)}...`;
  }

  return fullText;
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
  const captionText = formatCaptionsForPrompt(videoData.captions);
  const durationMinutes = getDurationMinutes(videoData.duration);

  return `Generate a high-quality MDX blog post based on the following YouTube video transcript and information:

**Video Information:**
- Title: ${videoData.title}
- Author: ${videoData.author}
- Duration: ${durationMinutes} minutes

**Video Transcript (Primary Source):**
${captionText}

**Objective:** Create a personal, engaging MDX blog post based primarily on the video transcript above. Transform the spoken content into a first-person narrative that feels like you're sharing your experience and knowledge directly with the reader.

**Target Audience Detection:** Analyze the video's title and transcript content to automatically determine the appropriate target audience (e.g., developers, designers, marketers, general audience, etc.). Write the blog post for that specific audience.

**Style Guide:**
1. **Content Creation:** Base the blog post primarily on the transcript content, writing in first person ("I", "my", "me") as if you're personally sharing your experience and knowledge
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
  createBlog,
  extractYouTubeData,
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

    let videoData: VideoData;

    try {
      videoData = await extractYouTubeData(youtubeUrl);
    } catch (error) {
      throw asBlogWorkflowError(error, "CAPTION_EXTRACTION_FAILED");
    }

    if (videoData.captions.length === 0) {
      throw new BlogWorkflowError("CAPTIONS_UNAVAILABLE");
    }

    let text: string;

    try {
      ({ text } = await generateText({
        model: BLOG_GENERATION_MODEL,
        prompt: createPrompt(videoData),
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
