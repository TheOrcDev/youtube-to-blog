"use client";

import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircleIcon />
          </EmptyMedia>
          <EmptyTitle>This page hit a problem</EmptyTitle>
          <EmptyDescription>
            The rest of the dashboard still works. Trying again usually clears
            it.
            {error.digest ? ` Reference: ${error.digest}.` : ""}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button className="w-full" onClick={reset} type="button">
            <RotateCcwIcon data-icon="inline-start" />
            Try again
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/dashboard">Go to my blogs</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
