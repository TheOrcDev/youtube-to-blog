import assert from "node:assert/strict";
import test from "node:test";

import { createBlogGenerator } from "../server/blog-generator.ts";

const VIDEO_URL = "https://www.youtube.com/watch?v=7GeFt8suV8E";
const DURATION_IN_PROMPT = /Duration: 8 minutes/;
const VIDEO_SOURCE_IN_PROMPT = /attached YouTube video's audio and visuals/;

test("a signed-in user can generate and save a blog with the configured AI model", async () => {
  const generatedContent = `# Master Web Scraping\n\n${"Useful article content. ".repeat(30)}`;
  const savedBlog = {
    author: "Firecrawl",
    content: generatedContent,
    id: 301,
    slug: "7GeFt8suV8E",
    title: "Master Web Scraping",
    userId: "user-123",
  };

  const generateBlog = createBlogGenerator({
    checkGenerationAllowance: (userId) => {
      assert.equal(userId, "user-123");
      return Promise.resolve({
        canUseCustomStyles: false,
        model: "google/gemini-2.5-flash",
      });
    },
    createBlog: (blog) => {
      assert.deepEqual(blog, {
        author: "Firecrawl",
        content: generatedContent,
        slug: "7GeFt8suV8E",
        title: "Master Web Scraping",
        userId: "user-123",
      });

      return Promise.resolve(savedBlog);
    },
    extractYouTubeMetadata: (url) => {
      assert.equal(url, VIDEO_URL);

      return Promise.resolve({
        author: "Firecrawl",
        description: "A video about web scraping.",
        duration: "PT8M42S",
        slug: "7GeFt8suV8E",
        title: "Master Web Scraping",
      });
    },
    generateText: ({ messages, model }) => {
      assert.equal(model, "google/gemini-2.5-flash");
      assert.equal(messages[0].role, "user");
      assert.equal(messages[0].content[0].type, "file");
      assert.equal(
        messages[0].content[0].data.toString(),
        "https://www.youtube.com/watch?v=7GeFt8suV8E"
      );
      assert.equal(messages[0].content[0].mediaType, "video/mp4");
      assert.equal(messages[0].content[1].type, "text");
      assert.match(messages[0].content[1].text, DURATION_IN_PROMPT);
      assert.match(messages[0].content[1].text, VIDEO_SOURCE_IN_PROMPT);

      return Promise.resolve({ text: generatedContent });
    },
    getCurrentUser: () =>
      Promise.resolve({
        user: { id: "user-123" },
      }),
    getSavedWritingStyle: () => Promise.resolve(null),
  });

  const result = await generateBlog(VIDEO_URL);

  assert.deepEqual(result, savedBlog);
});

test("an AI provider failure retains a safe, actionable code", async () => {
  const generateBlog = createBlogGenerator({
    checkGenerationAllowance: () =>
      Promise.resolve({
        canUseCustomStyles: false,
        model: "google/gemini-2.5-flash",
      }),
    createBlog: () => Promise.reject(new Error("should not save")),
    extractYouTubeMetadata: () =>
      Promise.resolve({
        author: "Firecrawl",
        description: "A video about web scraping.",
        duration: "PT8M42S",
        slug: "7GeFt8suV8E",
        title: "Master Web Scraping",
      }),
    generateText: () =>
      Promise.reject(new Error("gateway response included internal details")),
    getCurrentUser: () => Promise.resolve({ user: { id: "user-123" } }),
    getSavedWritingStyle: () => Promise.resolve(null),
  });

  await assert.rejects(
    () => generateBlog(VIDEO_URL),
    (error) => error.code === "AI_GENERATION_FAILED"
  );
});
