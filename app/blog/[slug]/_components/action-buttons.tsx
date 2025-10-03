"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ActionButtonsProps = {
  content: string;
};

export default function ActionButtons({ content }: ActionButtonsProps) {
  return (
    <div className="-translate-x-1/2 absolute top-4 left-1/2 mx-auto flex gap-2">
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
