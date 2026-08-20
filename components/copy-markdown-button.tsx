"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";

export function CopyMarkdownButton({
  className,
  content,
}: {
  className?: string;
  content: string;
}) {
  return (
    <Button
      className={className}
      onClick={() => {
        navigator.clipboard.writeText(content);
        toast.success("Blog has been copied to clipboard.");
      }}
      variant="outline"
    >
      Copy Markdown
    </Button>
  );
}
