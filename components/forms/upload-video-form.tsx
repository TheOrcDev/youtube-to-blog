"use client";

import { upload } from "@vercel/blob/client";
import { FileVideo, Loader2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SelectBlog } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import {
  MAX_UPLOAD_BYTES,
  SUPPORTED_UPLOAD_TYPES,
} from "@/lib/entitlements/policy";
import { toPublicBlogError } from "@/server/blog-errors";
import { requestUploadBlog } from "@/server/request-upload-blog";

const BYTES_PER_MB = 1024 * 1024;
const MAX_UPLOAD_MB = Math.floor(MAX_UPLOAD_BYTES / BYTES_PER_MB);
const PERCENT_MAX = 100;

type UploadPhase = "idle" | "uploading" | "generating";

function formatFileSize(bytes: number): string {
  return `${(bytes / BYTES_PER_MB).toFixed(1)}MB`;
}

function validateFile(file: File): string | null {
  if (!(SUPPORTED_UPLOAD_TYPES as readonly string[]).includes(file.type)) {
    return "This file format is not supported. Upload an MP4, WebM, or QuickTime video.";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `This video is too large. The maximum upload size is ${MAX_UPLOAD_MB}MB.`;
  }

  return null;
}

interface UploadVideoFormProps {
  onBlogCreated: (blog: SelectBlog) => void;
  styleId?: string;
}

export function UploadVideoForm({
  onBlogCreated,
  styleId,
}: UploadVideoFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);

  const isBusy = phase !== "idle";

  function selectFile(candidate: File | undefined) {
    if (!candidate) {
      return;
    }

    const problem = validateFile(candidate);

    if (problem) {
      toast.error(problem);
      return;
    }

    setFile(candidate);
  }

  async function onConvert() {
    if (!file) {
      return;
    }

    try {
      const user = await authClient.getSession();

      if (!user.data) {
        toast.error("Please login to create a blog.");
        return;
      }

      setPhase("uploading");
      setProgress(0);

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });

      setPhase("generating");

      const result = await requestUploadBlog(
        {
          filename: file.name,
          mediaType: file.type,
          uploadUrl: blob.url,
        },
        styleId
      );

      if (!result.ok) {
        const needsUpgrade =
          result.error.code === "QUOTA_EXCEEDED" ||
          result.error.code === "UPLOAD_REQUIRES_PRO";

        toast.error(result.error.message, {
          action: needsUpgrade
            ? { label: "Upgrade", onClick: () => router.push("/pricing") }
            : undefined,
        });
        return;
      }

      setFile(null);
      onBlogCreated(result.blog);
      toast.success("Blog has been created.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        toast.error(error.message);
        return;
      }

      toast.error(toPublicBlogError(error).message);
    } finally {
      setPhase("idle");
      setProgress(0);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <input
        accept={SUPPORTED_UPLOAD_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />

      {file ? (
        <div className="flex h-24 w-full items-center gap-3 rounded-md border border-input px-4 text-left">
          <FileVideo className="size-6 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{file.name}</p>
            <p className="text-muted-foreground text-xs">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button
            aria-label="Remove selected video"
            disabled={isBusy}
            onClick={() => setFile(null)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X />
          </Button>
        </div>
      ) : (
        <button
          className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-md border border-input border-dashed text-muted-foreground text-sm transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectFile(event.dataTransfer.files[0]);
          }}
          type="button"
        >
          <UploadCloud className="size-6" />
          <span>Drop a video here or click to browse</span>
          <span className="text-xs">
            MP4, WebM, or QuickTime · up to {MAX_UPLOAD_MB}MB
          </span>
        </button>
      )}

      <Button
        className="h-10 w-full"
        disabled={!file || isBusy}
        onClick={onConvert}
        type="button"
      >
        {phase === "uploading" && (
          <>
            <Loader2 className="animate-spin" />
            Uploading… {Math.min(Math.round(progress), PERCENT_MAX)}%
          </>
        )}
        {phase === "generating" && (
          <>
            <Loader2 className="animate-spin" />
            Writing your blog…
          </>
        )}
        {phase === "idle" && "Convert"}
      </Button>
    </div>
  );
}
