import { ImageResponse } from "next/og";
import { Simple } from "@/components/og/simple";

export const alt =
  "YouTube to Blog - Turn videos into SEO-ready blog posts with AI";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <Simple
      brand="youtube2blog.com"
      description="AI watches the audio and visuals, then writes a structured article you can publish, export as Markdown, or fetch over the API."
      label="Video to blog, in minutes"
      title="Your videos are invisible to Google. Your blog isn't."
    />,
    size
  );
}
