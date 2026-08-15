import assert from "node:assert/strict";
import test from "node:test";

import { BlogWorkflowError } from "../server/blog-errors.ts";
import { createBlogRequest } from "../server/blog-request.ts";

const VIDEO_URL = "https://www.youtube.com/watch?v=7GeFt8suV8E";

test("a caption extraction failure returns an actionable public error", async () => {
  const requestBlog = createBlogRequest({
    checkBlogExists: () => Promise.resolve(undefined),
    generateBlog: () =>
      Promise.reject(new BlogWorkflowError("CAPTION_EXTRACTION_FAILED")),
  });

  const result = await requestBlog(VIDEO_URL);

  assert.deepEqual(result, {
    error: {
      code: "CAPTION_EXTRACTION_FAILED",
      message:
        "YouTube could not provide captions right now. Please try again shortly.",
    },
    ok: false,
  });
});

test("an existing blog is returned without generating another one", async () => {
  const existingBlog = { id: 301, slug: "7GeFt8suV8E" };
  let generationCalls = 0;
  const requestBlog = createBlogRequest({
    checkBlogExists: () => Promise.resolve(existingBlog),
    generateBlog: () => {
      generationCalls += 1;
      return Promise.resolve(existingBlog);
    },
  });

  const result = await requestBlog(VIDEO_URL);

  assert.deepEqual(result, {
    blog: existingBlog,
    ok: true,
    status: "existing",
  });
  assert.equal(generationCalls, 0);
});

test("unexpected provider details are not exposed to the client", async () => {
  const requestBlog = createBlogRequest({
    checkBlogExists: () => Promise.resolve(undefined),
    generateBlog: () =>
      Promise.reject(new Error("provider request contained secret details")),
  });

  const result = await requestBlog(VIDEO_URL);

  assert.deepEqual(result, {
    error: {
      code: "UNKNOWN",
      message:
        "Something went wrong while creating the blog. Please try again.",
    },
    ok: false,
  });
});
