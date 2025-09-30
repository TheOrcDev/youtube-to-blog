"use server";

import { generateText } from "ai";

import { extractYouTubeData } from "@/lib/youtube";

const SECONDS_PER_MINUTE = 60;
const MAX_DESCRIPTION_LENGTH = 500;

export async function generateBlog(youtubeUrl: string) {
  try {
    // Extract YouTube video data
    const videoData = await extractYouTubeData(youtubeUrl);

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

                **Objective:** Transform the video's content (primarily based on its transcript and description) into a professional, engaging, and technically accurate MDX blog post.

                **Target Audience:** Technical professionals and developers (dev audience).

                **Style Guide:**
                1.  **Clarity & Engagement:** Write in a clear, engaging, and concise style. The tone should be informative and authoritative.
                2.  **Prose Conversion:** Do not simply dump the transcript. Rewrite the content into smooth, flowing, and professional prose. Eliminate filler words, stuttering, and transcript-style repetition.
                3.  **Code Inclusion:** Wherever the transcript presents code snippets (JavaScript, TypeScript, shell commands, configuration files, etc.), format them as standard MDX code blocks with proper language syntax highlighting.
                4.  **Structure & Formatting:**
                    * Use Markdown for the main structure.
                    * The entire output must be formatted as a single, valid **MDX** file.
                    * Start with a compelling title (you can use or adapt the video title).
                    * Use a strong, clear **Introduction** section.
                    * Organize the main content using clear, descriptive level-2 headings ('##') for major sections and level-3 headings ('###') for sub-points.
                    * End with a brief, summarizing **Conclusion**.

                **Output Format Constraint:** The output must be the complete, ready-to-publish MDX content, starting with the title and ending with the conclusion.`,
    });

    return text;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Failed to generate blog post"}`;
  }
}
