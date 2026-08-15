import assert from "node:assert/strict";
import test from "node:test";

import {
  createYouTubeExtractor,
  createYouTubeMetadataExtractor,
} from "../server/youtube.ts";

const VIDEO_ID = "7GeFt8suV8E";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

test("a captioned YouTube video can be extracted", async () => {
  const extractYouTubeData = createYouTubeExtractor({
    apiKey: "youtube-api-key",
    fetch: (input) => {
      const url = new URL(input);

      assert.equal(url.hostname, "www.googleapis.com");
      assert.equal(url.searchParams.get("id"), VIDEO_ID);
      assert.equal(url.searchParams.get("key"), "youtube-api-key");

      return Promise.resolve(
        Response.json({
          items: [
            {
              contentDetails: { duration: "PT8M42S" },
              snippet: {
                channelTitle: "Firecrawl",
                description: "A video about web scraping.",
                title: "Master Web Scraping",
              },
            },
          ],
        })
      );
    },
    getSubtitles: ({ lang, videoID }) => {
      assert.equal(lang, "en");
      assert.equal(videoID, VIDEO_ID);

      return Promise.resolve([
        { dur: "2.5", start: "0", text: "This scraper can scrape anything." },
      ]);
    },
  });

  const result = await extractYouTubeData(VIDEO_URL);

  assert.deepEqual(result, {
    author: "Firecrawl",
    captions: [
      { dur: "2.5", start: "0", text: "This scraper can scrape anything." },
    ],
    description: "A video about web scraping.",
    duration: "PT8M42S",
    slug: VIDEO_ID,
    title: "Master Web Scraping",
  });
});

test("caption provider failures retain a distinct error code", async () => {
  const extractYouTubeData = createYouTubeExtractor({
    apiKey: "youtube-api-key",
    fetch: () =>
      Promise.resolve(
        Response.json({
          items: [
            {
              contentDetails: { duration: "PT8M42S" },
              snippet: { title: "Master Web Scraping" },
            },
          ],
        })
      ),
    getSubtitles: () =>
      Promise.reject(new Error("caption provider changed its response")),
  });

  await assert.rejects(
    () => extractYouTubeData(VIDEO_URL),
    (error) => error.code === "CAPTION_EXTRACTION_FAILED"
  );
});

test("invalid YouTube URLs are rejected before external requests", async () => {
  let fetchCalls = 0;
  const extractYouTubeData = createYouTubeExtractor({
    apiKey: "youtube-api-key",
    fetch: () => {
      fetchCalls += 1;
      return Promise.reject(new Error("should not fetch"));
    },
    getSubtitles: () => Promise.reject(new Error("should not extract")),
  });

  await assert.rejects(
    () => extractYouTubeData("https://example.com/not-youtube"),
    (error) => error.code === "INVALID_YOUTUBE_URL"
  );
  assert.equal(fetchCalls, 0);
});

test("video metadata can be prepared without a server caption request", async () => {
  const extractYouTubeMetadata = createYouTubeMetadataExtractor({
    apiKey: "youtube-api-key",
    fetch: () =>
      Promise.resolve(
        Response.json({
          items: [
            {
              contentDetails: { duration: "PT8M42S" },
              snippet: { title: "Master Web Scraping" },
            },
          ],
        })
      ),
  });

  const result = await extractYouTubeMetadata(VIDEO_URL);

  assert.deepEqual(result, {
    author: "Unknown Author",
    description: "",
    duration: "PT8M42S",
    slug: VIDEO_ID,
    title: "Master Web Scraping",
  });
});
