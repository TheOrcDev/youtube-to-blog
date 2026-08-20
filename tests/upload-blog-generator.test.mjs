import assert from "node:assert/strict";
import test from "node:test";

import {
  createUploadBlogGenerator,
  extractBlogTitle,
  humanizeFilename,
  isSupportedUploadType,
  slugifyTitle,
} from "../server/upload-blog-generator.ts";

const UPLOAD_URL = "https://abc123.public.blob.vercel-storage.com/talk.mp4";
const FILENAME_IN_PROMPT = /my-talk\.mp4/;
const CURRENT_USER = {
  user: { email: "user@example.com", id: "user-123", name: "Jane" },
};

function makeGeneratedContent(title) {
  return `# ${title}\n\n${"Useful article content. ".repeat(30)}`;
}

function makeDependencies(overrides = {}) {
  return {
    checkGenerationAllowance: () =>
      Promise.resolve({ model: "anthropic/claude-sonnet-4-5" }),
    checkUploadAllowance: () => Promise.resolve(),
    createBlog: (blog) => Promise.resolve({ ...blog, id: 1 }),
    deleteUpload: () => Promise.resolve(),
    fetchUploadBytes: () => Promise.resolve(new Uint8Array(1024)),
    generateText: () =>
      Promise.resolve({ text: makeGeneratedContent("My Upload Story") }),
    getCurrentUser: () => Promise.resolve(CURRENT_USER),
    randomSlugSuffix: () => "abcd1234",
    ...overrides,
  };
}

const UPLOAD_INPUT = {
  filename: "my-talk.mp4",
  mediaType: "video/mp4",
  uploadUrl: UPLOAD_URL,
};

test("a pro user can generate a blog from an uploaded video", async () => {
  const deleted = [];
  let sentBytes = null;

  const generateBlogFromUpload = createUploadBlogGenerator(
    makeDependencies({
      deleteUpload: (url) => {
        deleted.push(url);
        return Promise.resolve();
      },
      generateText: ({ messages, model }) => {
        assert.equal(model, "anthropic/claude-sonnet-4-5");
        assert.equal(messages[0].content[0].type, "file");
        assert.equal(messages[0].content[0].mediaType, "video/mp4");
        sentBytes = messages[0].content[0].data;
        assert.match(messages[0].content[1].text, FILENAME_IN_PROMPT);
        return Promise.resolve({
          text: makeGeneratedContent("My Upload Story"),
        });
      },
    })
  );

  const blog = await generateBlogFromUpload(UPLOAD_INPUT);

  assert.equal(sentBytes.byteLength, 1024);
  assert.equal(blog.title, "My Upload Story");
  assert.equal(blog.slug, "my-upload-story-abcd1234");
  assert.equal(blog.sourceType, "upload");
  assert.equal(blog.originalFilename, "my-talk.mp4");
  assert.equal(blog.author, "Jane");
  assert.deepEqual(deleted, [UPLOAD_URL]);
});

test("the upload is deleted even when generation fails", async () => {
  const deleted = [];

  const generateBlogFromUpload = createUploadBlogGenerator(
    makeDependencies({
      deleteUpload: (url) => {
        deleted.push(url);
        return Promise.resolve();
      },
      generateText: () => Promise.reject(new Error("model exploded")),
    })
  );

  await assert.rejects(generateBlogFromUpload(UPLOAD_INPUT), {
    code: "AI_GENERATION_FAILED",
  });
  assert.deepEqual(deleted, [UPLOAD_URL]);
});

test("free users are rejected before any bytes are fetched", async () => {
  let fetched = false;

  const generateBlogFromUpload = createUploadBlogGenerator(
    makeDependencies({
      checkUploadAllowance: () =>
        Promise.reject(
          Object.assign(new Error("UPLOAD_REQUIRES_PRO"), {
            code: "UPLOAD_REQUIRES_PRO",
          })
        ),
      fetchUploadBytes: () => {
        fetched = true;
        return Promise.resolve(new Uint8Array(1));
      },
    })
  );

  await assert.rejects(generateBlogFromUpload(UPLOAD_INPUT));
  assert.equal(fetched, false);
});

test("unsupported media types are rejected without touching dependencies", async () => {
  let userLookedUp = false;

  const generateBlogFromUpload = createUploadBlogGenerator(
    makeDependencies({
      getCurrentUser: () => {
        userLookedUp = true;
        return Promise.resolve(CURRENT_USER);
      },
    })
  );

  await assert.rejects(
    generateBlogFromUpload({ ...UPLOAD_INPUT, mediaType: "video/x-msvideo" }),
    { code: "UPLOAD_UNSUPPORTED_FORMAT" }
  );
  assert.equal(userLookedUp, false);
});

test("oversized uploads are rejected after download", async () => {
  const generateBlogFromUpload = createUploadBlogGenerator(
    makeDependencies({
      fetchUploadBytes: () => Promise.resolve(new Uint8Array(65 * 1024 * 1024)),
    })
  );

  await assert.rejects(generateBlogFromUpload(UPLOAD_INPUT), {
    code: "UPLOAD_TOO_LARGE",
  });
});

test("short AI output is rejected as invalid", async () => {
  const generateBlogFromUpload = createUploadBlogGenerator(
    makeDependencies({
      generateText: () => Promise.resolve({ text: "# Too short" }),
    })
  );

  await assert.rejects(generateBlogFromUpload(UPLOAD_INPUT), {
    code: "AI_OUTPUT_INVALID",
  });
});

test("a signed-out user cannot generate from an upload", async () => {
  const generateBlogFromUpload = createUploadBlogGenerator(
    makeDependencies({ getCurrentUser: () => Promise.resolve(null) })
  );

  await assert.rejects(generateBlogFromUpload(UPLOAD_INPUT), {
    code: "AUTH_REQUIRED",
  });
});

test("extractBlogTitle prefers the first heading and falls back to the filename", () => {
  assert.equal(
    extractBlogTitle("# **Bold Title**\n\nBody", "clip.mp4"),
    "Bold Title"
  );
  assert.equal(
    extractBlogTitle("No heading here", "my_cool-video.mp4"),
    "my cool video"
  );
});

test("humanizeFilename strips extensions and separators", () => {
  assert.equal(
    humanizeFilename("weekly_standup-recording.mov"),
    "weekly standup recording"
  );
  assert.equal(humanizeFilename(".mp4"), "Uploaded video");
});

test("slugifyTitle produces url-safe slugs with a suffix", () => {
  assert.equal(slugifyTitle("Hello, World!", "xyz"), "hello-world-xyz");
  assert.equal(slugifyTitle("///", "xyz"), "xyz");
});

test("isSupportedUploadType accepts the documented formats only", () => {
  assert.equal(isSupportedUploadType("video/mp4"), true);
  assert.equal(isSupportedUploadType("video/webm"), true);
  assert.equal(isSupportedUploadType("video/quicktime"), true);
  assert.equal(isSupportedUploadType("video/x-matroska"), false);
});
