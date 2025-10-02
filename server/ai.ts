"use server";

import { generateText } from "ai";

import { extractYouTubeData } from "@/lib/youtube";
import { createBlog } from "./blogs";

const SECONDS_PER_MINUTE = 60;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_BLOG_LENGTH = 500; // Minimum blog post length to ensure quality

export async function generateBlog(youtubeUrl: string) {
  try {
    // Extract YouTube video data
    const videoData = await extractYouTubeData(youtubeUrl);

    const { text } = await generateText({
      model: "gemini-2.5-flash",
      prompt: `Generate a high-quality MDX blog post based on the following YouTube video information:

                **Video Information:**
                - Title: ${videoData.title}
                - Author: ${videoData.author}
                - Duration: ${Math.floor(Number.parseInt(videoData.duration, 10) / SECONDS_PER_MINUTE)} minutes
                - Description: ${videoData.description.substring(0, MAX_DESCRIPTION_LENGTH)}${videoData.description.length > MAX_DESCRIPTION_LENGTH ? "..." : ""}

                **Objective:** Create a professional, engaging MDX blog post based on the video's title, description, and metadata. Since transcript is not available, focus on creating valuable content that would be relevant to the video's topic.

                **Target Audience Detection:** Analyze the video's title and description to automatically determine the appropriate target audience (e.g., developers, designers, marketers, general audience, etc.). Write the blog post for that specific audience.

                **Style Guide:**
                1.  **Content Creation:** Create informative content based on the video's topic and description
                2.  **Structure & Formatting:**
                    * Use Markdown for the main structure
                    * Format as a single, valid **MDX** file
                    * Start with a compelling title (adapt the video title if needed)
                    * Use a clear **Introduction** section
                    * Organize content using level-2 headings ('##') for major sections and level-3 headings ('###') for sub-points
                    * End with a **Conclusion** that summarizes the key points
                3.  **Code Inclusion:** Include relevant code examples where appropriate for the topic
                4.  **Educational Value:** Ensure the content provides educational value related to the video's topic

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
