"use client";

import { useCallback, useState } from "react";

import type { SelectBlog } from "@/db/schema";
import type {
  GenerationProgressState,
  GenerationStreamEvent,
  SerializedBlog,
} from "@/lib/generation-stream";
import type { PublicBlogError } from "@/server/blog-errors";

export type GenerateInput =
  | { source: "youtube"; styleId?: string; youtubeUrl: string }
  | {
      filename: string;
      mediaType: string;
      source: "upload";
      styleId?: string;
      uploadUrl: string;
    };

export type GenerateOutcome =
  | { blog: SelectBlog; ok: true; status: "created" | "existing" }
  | { error: PublicBlogError; ok: false };

const IDLE_STATE: GenerationProgressState = {
  article: "",
  isRunning: false,
  stage: null,
  thinking: "",
};

const NETWORK_ERROR: PublicBlogError = {
  code: "UNKNOWN",
  message: "The connection was interrupted. Please try again.",
};

function reviveBlog(blog: SerializedBlog): SelectBlog {
  return {
    ...blog,
    createdAt: new Date(blog.createdAt),
    updatedAt: new Date(blog.updatedAt),
  };
}

async function readEvents(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: GenerationStreamEvent) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    // biome-ignore lint/performance/noAwaitInLoops: stream chunks can only be read sequentially
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim()) {
        onEvent(JSON.parse(line) as GenerationStreamEvent);
      }
    }
  }
}

export function useBlogGeneration() {
  const [progress, setProgress] = useState<GenerationProgressState>(IDLE_STATE);

  const reset = useCallback(() => setProgress(IDLE_STATE), []);

  const generate = useCallback(
    async (input: GenerateInput): Promise<GenerateOutcome> => {
      setProgress({ ...IDLE_STATE, isRunning: true, stage: "checking" });

      let outcome: GenerateOutcome = { error: NETWORK_ERROR, ok: false };

      try {
        const response = await fetch("/api/generate", {
          body: JSON.stringify(input),
          headers: { "content-type": "application/json" },
          method: "POST",
        });

        if (!(response.ok && response.body)) {
          const payload = (await response.json().catch(() => null)) as {
            error?: PublicBlogError;
          } | null;

          return {
            error: payload?.error ?? NETWORK_ERROR,
            ok: false,
          };
        }

        await readEvents(response.body, (event) => {
          switch (event.type) {
            case "status":
              setProgress((prev) => ({ ...prev, stage: event.stage }));
              break;
            case "thinking":
              setProgress((prev) => ({
                ...prev,
                thinking: prev.thinking + event.text,
              }));
              break;
            case "article":
              setProgress((prev) => ({
                ...prev,
                article: prev.article + event.text,
              }));
              break;
            case "blog":
              outcome = {
                blog: reviveBlog(event.blog),
                ok: true,
                status: event.status,
              };
              break;
            case "error":
              outcome = { error: event.error, ok: false };
              break;
            default:
              break;
          }
        });

        return outcome;
      } catch {
        return { error: NETWORK_ERROR, ok: false };
      } finally {
        setProgress((prev) => ({ ...prev, isRunning: false }));
      }
    },
    []
  );

  return { generate, progress, reset };
}
