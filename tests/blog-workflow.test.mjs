import assert from "node:assert/strict";
import test from "node:test";

import { createBlogGenerator } from "../server/blog-generator.ts";
import { createBlogRequest } from "../server/blog-request.ts";
import { extractVideoId } from "../server/youtube.ts";

const VIDEO_ID = "7GeFt8suV8E";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

test("an authenticated blog can be generated, persisted, and retrieved", async () => {
  const blogs = new Map();
  let generationCalls = 0;
  const generatedContent = `# Master Web Scraping\n\n${"Useful article content. ".repeat(30)}`;

  const generateBlog = createBlogGenerator({
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
    extractYouTubeData: () =>
      Promise.resolve({
        author: "Firecrawl",
        captions: [{ dur: "2.5", start: "0", text: "Caption text." }],
        description: "A video about web scraping.",
        duration: "PT8M42S",
        slug: VIDEO_ID,
        title: "Master Web Scraping",
      }),
    generateText: () => {
      generationCalls += 1;
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

  const existing = await requestBlog(VIDEO_URL);
  assert.equal(existing.ok, true);
  assert.equal(existing.status, "existing");
  assert.equal(existing.blog.id, created.blog.id);
  assert.equal(generationCalls, 1);
});
