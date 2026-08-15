import assert from "node:assert/strict";
import test from "node:test";

import { createYouTubeExtractor } from "../server/youtube.ts";

const VIDEO_ID = "7GeFt8suV8E";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

test("a captioned YouTube video can be prepared for blog generation", async () => {
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
