import { extractYouTubeData } from "../server/youtube.ts";

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=7GeFt8suV8E";
const videoUrl = process.argv[2] ?? DEFAULT_VIDEO_URL;

const video = await extractYouTubeData(videoUrl);

if (!(video.slug && video.title && video.captions.length > 0)) {
  throw new Error("Caption smoke returned incomplete video data");
}

console.log(
  JSON.stringify({
    captionCount: video.captions.length,
    duration: video.duration,
    ok: true,
    slug: video.slug,
    title: video.title,
  })
);
