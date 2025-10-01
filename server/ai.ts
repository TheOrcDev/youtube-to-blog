"use server";

import { generateText } from "ai";

import { extractYouTubeData } from "@/lib/youtube";
import { createBlog } from "./blogs";

const SECONDS_PER_MINUTE = 60;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_TRANSCRIPT_LENGTH = 100; // Minimum transcript length to ensure quality
const MIN_BLOG_LENGTH = 500; // Minimum blog post length to ensure quality

export async function generateBlog(youtubeUrl: string) {
  try {
    // Extract YouTube video data
    const videoData = await extractYouTubeData(youtubeUrl);

    // Validate transcript quality
    if (
      !videoData.transcript ||
      videoData.transcript.length < MIN_TRANSCRIPT_LENGTH
    ) {
      throw new Error(
        `Insufficient transcript data. Transcript length: ${videoData.transcript?.length || 0} characters. Minimum required: ${MIN_TRANSCRIPT_LENGTH} characters.`
      );
    }

    const { text } = await generateText({
      model: "gemini-2.5-flash",
      prompt: `Generate a high-quality MDX blog post from the following YouTube video:

                **Video Information:**
                - Title: ${videoData.title}
                - Author: ${videoData.author}
                - Duration: ${Math.floor(Number.parseInt(videoData.duration, 10) / SECONDS_PER_MINUTE)} minutes
                - Description: ${videoData.description.substring(0, MAX_DESCRIPTION_LENGTH)}${videoData.description.length > MAX_DESCRIPTION_LENGTH ? "..." : ""}

                **Video Transcript:**
                ${videoData.transcript}

                **CRITICAL CONTENT FIDELITY REQUIREMENTS:**
                - ONLY use information explicitly present in the transcript above
                - DO NOT add any external knowledge, examples, or explanations not mentioned in the video
                - DO NOT fill in gaps with your own technical knowledge
                - DO NOT add code examples that aren't shown in the transcript
                - DO NOT add links, references, or resources not mentioned in the video
                - If the transcript is incomplete or unclear, acknowledge limitations rather than guessing
                - Stay strictly within the scope of what the creator actually said

                **Objective:** Transform ONLY the video's transcript content into a professional, engaging MDX blog post without adding external information.

                **Target Audience Detection:** Analyze the video's title, description, and transcript content to automatically determine the appropriate target audience (e.g., developers, designers, marketers, general audience, etc.). Write the blog post for that specific audience.

                **Style Guide:**
                1.  **Content Fidelity:** Rewrite the transcript into smooth prose while preserving ALL original meaning and technical details exactly as presented.
                2.  **Prose Conversion:** Eliminate filler words, stuttering, and repetition while maintaining the creator's original intent and technical accuracy.
                3.  **Code Inclusion:** Only include code snippets that are explicitly shown or described in the transcript. Format them as MDX code blocks with proper syntax highlighting.
                4.  **Structure & Formatting:**
                    * Use Markdown for the main structure
                    * Format as a single, valid **MDX** file
                    * Start with a compelling title (adapt the video title if needed)
                    * Use a clear **Introduction** section based on the video's opening
                    * Organize content using level-2 headings ('##') for major sections and level-3 headings ('###') for sub-points
                    * End with a **Conclusion** that summarizes only what was covered in the video

                **Output Format:** Complete, ready-to-publish MDX content starting with the title and ending with the conclusion. NO frontmatter (YAML metadata with --- markers).`,
    });

    // Validate generated content quality
    if (!text || text.length < MIN_BLOG_LENGTH) {
      throw new Error(
        `Generated blog post is too short or empty. Length: ${text?.length || 0} characters. Minimum required: ${MIN_BLOG_LENGTH} characters. Please try again with a different video.`
      );
    }

    // Check for potential hallucination indicators
    const hallucinationIndicators = [
      "according to the latest research",
      "recent studies show",
      "experts recommend",
      "best practices suggest",
      "industry standard",
      "as we know",
      "it's important to note that",
    ];

    const hasPotentialHallucination = hallucinationIndicators.some(
      (indicator) => text.toLowerCase().includes(indicator.toLowerCase())
    );

    if (hasPotentialHallucination) {
      // Note: Content may contain external knowledge not from the video transcript
      // In production, this could trigger additional validation or user notification
    }

    const blog = await createBlog({
      content: text,
      slug: videoData.slug,
      title: videoData.title,
      author: videoData.author,
    });

    return blog;
  } catch (error) {
    throw new Error("Failed to generate blog", { cause: error });
  }
}
