// Spike: can the AI Gateway video path handle non-YouTube sources?
// Mode "url":   pass a remote mp4 URL as a file part (gateway/provider fetches it)
// Mode "bytes": download the mp4 locally and pass raw bytes as a file part
import { generateText } from "ai";

import { assertAiGatewayConfiguration } from "../server/ai-gateway.ts";
import { BLOG_GENERATION_MODEL } from "../server/blog-generator.ts";

const mode = process.argv[2] ?? "bytes";
const videoUrl =
  process.argv[3] ?? "https://www.w3schools.com/html/mov_bbb.mp4";

assertAiGatewayConfiguration({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  oidcToken: process.env.VERCEL_OIDC_TOKEN,
});

let data;

if (mode === "bytes") {
  if (videoUrl.startsWith("http")) {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }
    data = new Uint8Array(await response.arrayBuffer());
  } else {
    const { readFile } = await import("node:fs/promises");
    data = new Uint8Array(await readFile(videoUrl));
  }
  console.log(`Loaded ${data.byteLength} bytes`);
} else {
  data = new URL(videoUrl);
}

const result = await generateText({
  messages: [
    {
      content: [
        { data, mediaType: "video/mp4", type: "file" },
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
    mode,
    model: BLOG_GENERATION_MODEL,
    ok: true,
    topic: result.text.trim(),
  })
);
