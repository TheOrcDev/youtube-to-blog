import assert from "node:assert/strict";
import test from "node:test";

import { createBlogGenerator } from "../server/blog-generator.ts";

const VIDEO_URL = "https://www.youtube.com/watch?v=7GeFt8suV8E";
const DURATION_IN_PROMPT = /Duration: 8 minutes/;
const TRANSCRIPT_IN_PROMPT = /This scraper can scrape anything\./;

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
    extractYouTubeData: (url) => {
      assert.equal(url, VIDEO_URL);

      return Promise.resolve({
        author: "Firecrawl",
        captions: [
          { dur: "2.5", start: "0", text: "This scraper can scrape anything." },
        ],
        description: "A video about web scraping.",
        duration: "PT8M42S",
        slug: "7GeFt8suV8E",
        title: "Master Web Scraping",
      });
    },
    generateText: ({ model, prompt }) => {
      assert.equal(model, "google/gemini-2.5-flash");
      assert.match(prompt, DURATION_IN_PROMPT);
      assert.match(prompt, TRANSCRIPT_IN_PROMPT);

      return Promise.resolve({ text: generatedContent });
    },
    getCurrentUser: () =>
      Promise.resolve({
        user: { id: "user-123" },
      }),
  });

  const result = await generateBlog(VIDEO_URL);

  assert.deepEqual(result, savedBlog);
});

test("an AI provider failure retains a safe, actionable code", async () => {
  const generateBlog = createBlogGenerator({
    createBlog: () => Promise.reject(new Error("should not save")),
    extractYouTubeData: () =>
      Promise.resolve({
        author: "Firecrawl",
        captions: [{ dur: "2.5", start: "0", text: "Caption text." }],
        description: "A video about web scraping.",
        duration: "PT8M42S",
        slug: "7GeFt8suV8E",
        title: "Master Web Scraping",
      }),
    generateText: () =>
      Promise.reject(new Error("gateway response included internal details")),
    getCurrentUser: () => Promise.resolve({ user: { id: "user-123" } }),
  });

  await assert.rejects(
    () => generateBlog(VIDEO_URL),
    (error) => error.code === "AI_GENERATION_FAILED"
  );
});
