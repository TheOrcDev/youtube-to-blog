import { generateText } from "ai";

import { assertAiGatewayConfiguration } from "../server/ai-gateway.ts";
import { BLOG_GENERATION_MODEL } from "../server/blog-generator.ts";

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=7GeFt8suV8E";
const videoUrl = process.argv[2] ?? DEFAULT_VIDEO_URL;

assertAiGatewayConfiguration({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  oidcToken: process.env.VERCEL_OIDC_TOKEN,
});

const result = await generateText({
  messages: [
    {
      content: [
        { data: new URL(videoUrl), mediaType: "video/mp4", type: "file" },
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

if (!result.text.trim()) {
  throw new Error("Gemini returned no text for the YouTube video");
}

console.log(
  JSON.stringify({
    finishReason: result.finishReason,
    model: BLOG_GENERATION_MODEL,
    ok: true,
    topic: result.text.trim(),
  })
);
