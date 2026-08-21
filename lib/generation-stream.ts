import type { SelectBlog } from "@/db/schema";
import type { PublicBlogError } from "@/server/blog-errors";

// NDJSON events sent by POST /api/generate while a blog is being written.
export type GenerationStage = "checking" | "fetching" | "generating" | "saving";

export const GENERATION_STAGE_LABELS: Record<GenerationStage, string> = {
  checking: "Checking your plan and quota",
  fetching: "Fetching the video",
  generating: "Watching the video and writing",
  saving: "Saving your article",
};

// Over JSON the blog's Date fields arrive as ISO strings; the client revives
// them before handing the blog to components.
export type SerializedBlog = Omit<SelectBlog, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

export interface GenerationProgressState {
  article: string;
  isRunning: boolean;
  stage: GenerationStage | null;
  thinking: string;
}

export type GenerationStreamEvent =
  | { stage: GenerationStage; type: "status" }
  | { text: string; type: "thinking" }
  | { text: string; type: "article" }
  | { blog: SerializedBlog; status: "created" | "existing"; type: "blog" }
  | { error: PublicBlogError; type: "error" };
