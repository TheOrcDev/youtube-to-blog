import assert from "node:assert/strict";
import test from "node:test";

import { postOgImages, SITE_OG_IMAGE_PATH, siteOgImages } from "../lib/og.ts";

test("the site share image is a static png at 1200x630", () => {
  assert.equal(SITE_OG_IMAGE_PATH.endsWith(".png"), true);

  const [image] = siteOgImages;

  assert.ok(image);
  assert.equal(image.url, SITE_OG_IMAGE_PATH);
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
  assert.equal(image.type, "image/png");
});

test("blog share images use a png path for crawlers that require an extension", () => {
  const [image] = postOgImages("my-post", "My post");

  assert.ok(image);
  assert.equal(image.url, "/blog/my-post/opengraph.png");
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
  assert.equal(image.alt, "My post");
});
