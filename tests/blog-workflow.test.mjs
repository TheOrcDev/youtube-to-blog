import assert from "node:assert/strict";
import test from "node:test";

import { extractVideoId } from "../lib/youtube-url.ts";
import { BlogWorkflowError } from "../server/blog-errors.ts";
import { createBlogGenerator } from "../server/blog-generator.ts";
import { createBlogRequest } from "../server/blog-request.ts";

const VIDEO_ID = "7GeFt8suV8E";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

test("an authenticated blog can be generated, persisted, and retrieved", async () => {
  const blogs = new Map();
  let generationCalls = 0;
  let allowanceCalls = 0;
  let modelUsed;
  const generatedContent = `# Master Web Scraping\n\n${"Useful article content. ".repeat(30)}`;

  const generateBlog = createBlogGenerator({
    checkGenerationAllowance: () => {
      allowanceCalls += 1;
      return Promise.resolve({ model: "anthropic/claude-sonnet-4-5" });
    },
    createBlog: (input) => {
      const blog = {
        ...input,
        createdAt: new Date("2026-08-15T10:00:00.000Z"),
        id: blogs.size + 1,
        updatedAt: new Date("2026-08-15T10:00:00.000Z"),
      };
      blogs.set(blog.slug, blog);
      return Promise.resolve(blog);
    },
    extractYouTubeMetadata: () =>
      Promise.resolve({
        author: "Firecrawl",
        description: "A video about web scraping.",
        duration: "PT8M42S",
        slug: VIDEO_ID,
        title: "Master Web Scraping",
      }),
    generateText: ({ model }) => {
      generationCalls += 1;
      modelUsed = model;
      return Promise.resolve({ text: generatedContent });
    },
    getCurrentUser: () => Promise.resolve({ user: { id: "user-123" } }),
  });

  const requestBlog = createBlogRequest({
    checkBlogExists: (youtubeUrl) => {
      const slug = extractVideoId(youtubeUrl);
      return Promise.resolve(slug ? blogs.get(slug) : undefined);
    },
    generateBlog,
  });

  const created = await requestBlog(VIDEO_URL);
  assert.equal(created.ok, true);
  assert.equal(created.status, "created");
  assert.equal(created.blog.userId, "user-123");

  const viewedBlog = blogs.get(VIDEO_ID);
  assert.equal(viewedBlog.content, generatedContent);
  assert.equal(viewedBlog.title, "Master Web Scraping");

  // The tier's model reaches the provider.
  assert.equal(modelUsed, "anthropic/claude-sonnet-4-5");

  const existing = await requestBlog(VIDEO_URL);
  assert.equal(existing.ok, true);
  assert.equal(existing.status, "existing");
  assert.equal(existing.blog.id, created.blog.id);
  assert.equal(generationCalls, 1);

  // Serving an already-generated blog costs no AI call, so it must not consume
  // the user's monthly quota.
  assert.equal(allowanceCalls, 1);
});

test("an exhausted monthly quota blocks generation before any AI call", async () => {
  let generationCalls = 0;

  const generateBlog = createBlogGenerator({
    checkGenerationAllowance: () =>
      Promise.reject(new BlogWorkflowError("QUOTA_EXCEEDED")),
    createBlog: () => Promise.reject(new Error("should not save")),
    extractYouTubeMetadata: () =>
      Promise.reject(new Error("should not fetch metadata")),
    generateText: () => {
      generationCalls += 1;
      return Promise.resolve({ text: "unused" });
    },
    getCurrentUser: () => Promise.resolve({ user: { id: "user-123" } }),
  });

  const requestBlog = createBlogRequest({
    checkBlogExists: () => Promise.resolve(undefined),
    generateBlog,
  });

  const result = await requestBlog(VIDEO_URL);

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "QUOTA_EXCEEDED");
  assert.equal(generationCalls, 0);
});
