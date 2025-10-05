"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";

export function CopyMarkdownButton({ content }: { content: string }) {
  return (
    <Button
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
