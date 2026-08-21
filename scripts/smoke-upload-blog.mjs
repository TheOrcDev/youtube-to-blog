/**
 * End-to-end smoke test for the upload pipeline (minus auth/entitlements):
 * uploads a small video to Vercel Blob, downloads the bytes back, sends them
 * through the AI Gateway, and deletes the blob — mirroring
 * server/request-upload-blog.ts.
 *
 * Usage:  node --env-file=.env --env-file=.env.local scripts/smoke-upload-blog.mjs [pathToVideo]
 */
import { readFile } from "node:fs/promises";
import { del, put } from "@vercel/blob";
import { generateText } from "ai";

import { assertAiGatewayConfiguration } from "../server/ai-gateway.ts";
import { BLOG_GENERATION_MODEL } from "../server/blog-generator.ts";

const [, , videoPath] = process.argv;

if (!videoPath) {
  console.error("Usage: smoke-upload-blog.mjs <pathToVideo.mp4>");
  process.exit(1);
}

assertAiGatewayConfiguration({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  oidcToken: process.env.VERCEL_OIDC_TOKEN,
});

const fileBytes = await readFile(videoPath);

const blob = await put(`smoke/${Date.now()}.mp4`, fileBytes, {
  access: "public",
  contentType: "video/mp4",
});

console.log(`Uploaded to ${blob.url}`);

try {
  const parsed = new URL(blob.url);

  if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
    throw new Error(`Unexpected blob host: ${parsed.hostname}`);
  }

  const response = await fetch(blob.url);

  if (!response.ok) {
    throw new Error(`Failed to fetch blob: ${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  console.log(`Fetched ${bytes.byteLength} bytes back from Blob`);

  const result = await generateText({
    messages: [
      {
        content: [
          { data: bytes, mediaType: "video/mp4", type: "file" },
          {
            text: "Reply with only the main topic of this video in five words or fewer.",
            type: "text",
          },
        ],
        role: "user",
      },
    ],
    model: BLOG_GENERATION_MODEL,
  });

  console.log(
    JSON.stringify({
      finishReason: result.finishReason,
      ok: true,
      topic: result.text.trim(),
    })
  );
} finally {
  await del(blob.url);
  console.log("Blob deleted");
}
