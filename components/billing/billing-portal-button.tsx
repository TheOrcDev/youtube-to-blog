"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function openPortal() {
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });

      const payload = (await response.json()) as {
        error?: string;
        url?: string;
      };

      if (!(response.ok && payload.url)) {
        setError(payload.error ?? "The billing portal is unavailable.");
        setIsPending(false);
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setError("The billing portal is unavailable. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        disabled={isPending}
        onClick={openPortal}
        type="button"
        variant="outline"
      >
        {isPending ? "Opening…" : "Manage subscription"}
      </Button>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
