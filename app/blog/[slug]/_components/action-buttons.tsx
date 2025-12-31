"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  content: string;
}

export default function ActionButtons({ content }: ActionButtonsProps) {
  return (
    <div className="absolute top-4 left-1/2 mx-auto flex -translate-x-1/2 gap-2">
      <Button asChild variant="outline">
        <Link href="/">Back</Link>
      </Button>

      <Button
        onClick={() => {
          navigator.clipboard.writeText(content || "");
          toast.success("Markdown has been copied to clipboard.");
        }}
        variant="outline"
      >
        Copy Markdown
      </Button>
    </div>
  );
}
