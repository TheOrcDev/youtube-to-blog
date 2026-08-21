"use client";

import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  GENERATION_STAGE_LABELS,
  type GenerationProgressState,
  type GenerationStage,
} from "@/lib/generation-stream";
import { cn } from "@/lib/utils";

const STAGE_ORDER: GenerationStage[] = [
  "checking",
  "fetching",
  "generating",
  "saving",
];

const BOLD_MARKERS = /\*\*/g;
const WORDS = /\s+/;

function latestThought(thinking: string): string {
  const lines = thinking.split("\n").filter((line) => line.trim().length > 0);
  const last = lines.at(-1) ?? "";

  return last.replace(BOLD_MARKERS, "").trim();
}

function StageIcon({
  isActive,
  isDone,
}: {
  isActive: boolean;
  isDone: boolean;
}) {
  if (isDone) {
    return <Check className="size-4 text-primary" />;
  }

  if (isActive) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return (
    <span className="flex size-4 items-center justify-center">
      <span className="size-1.5 rounded-full bg-current" />
    </span>
  );
}

function StageRow({
  isActive,
  isDone,
  label,
}: {
  isActive: boolean;
  isDone: boolean;
  label: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-sm",
        isDone && "text-muted-foreground",
        isActive && "font-medium text-foreground",
        !(isDone || isActive) && "text-muted-foreground/50"
      )}
    >
      <StageIcon isActive={isActive} isDone={isDone} />
      {label}
    </li>
  );
}

function ThinkingPanel({ thinking }: { thinking: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = logRef.current;

    if (isExpanded && thinking && node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [isExpanded, thinking]);

  return (
    <div className="rounded-md border border-input bg-muted/30">
      <button
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
        onClick={() => setIsExpanded((prev) => !prev)}
        type="button"
      >
        <Sparkles className="size-4 shrink-0 animate-pulse text-primary" />
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          {latestThought(thinking) || "Thinking…"}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded ? (
        <div
          className="max-h-48 overflow-y-auto whitespace-pre-wrap border-input border-t px-3 py-2 text-muted-foreground text-xs"
          ref={logRef}
        >
          {thinking.replace(BOLD_MARKERS, "")}
        </div>
      ) : null}
    </div>
  );
}

function ArticlePreview({ article }: { article: string }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const words = article.split(WORDS).filter(Boolean).length;

  useEffect(() => {
    const node = previewRef.current;

    if (article && node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [article]);

  return (
    <div className="rounded-md border border-input">
      <div className="flex items-center justify-between border-input border-b px-3 py-2">
        <span className="font-medium text-sm">Your article, live</span>
        <span className="text-muted-foreground text-xs">
          {words.toLocaleString("en-US")} words
        </span>
      </div>
      <div
        className="max-h-72 overflow-y-auto whitespace-pre-wrap px-4 py-3 font-mono text-muted-foreground text-xs leading-relaxed"
        ref={previewRef}
      >
        {article}
      </div>
    </div>
  );
}

export function GenerationProgress({
  progress,
}: {
  progress: GenerationProgressState;
}) {
  const activeIndex = progress.stage ? STAGE_ORDER.indexOf(progress.stage) : -1;

  return (
    <output
      aria-label="Blog generation progress"
      aria-live="polite"
      className="flex w-full flex-col gap-3"
    >
      <ul className="flex flex-col gap-1.5">
        {STAGE_ORDER.map((stage, index) => (
          <StageRow
            isActive={index === activeIndex}
            isDone={index < activeIndex}
            key={stage}
            label={GENERATION_STAGE_LABELS[stage]}
          />
        ))}
      </ul>

      {progress.thinking ? (
        <ThinkingPanel thinking={progress.thinking} />
      ) : null}

      {progress.article ? <ArticlePreview article={progress.article} /> : null}
    </output>
  );
}
