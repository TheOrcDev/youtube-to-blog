"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { BillingInterval } from "@/lib/billing/pricing";

interface CheckoutButtonProps {
  children: React.ReactNode;
  className?: string;
  interval: BillingInterval;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export function CheckoutButton({
  children,
  className,
  interval,
  variant,
}: CheckoutButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function startCheckout() {
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/billing/checkout", {
        body: JSON.stringify({ interval }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json()) as {
        error?: string;
        url?: string;
      };

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      if (!(response.ok && payload.url)) {
        setError(payload.error ?? "Checkout could not be started.");
        setIsPending(false);
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setError("Checkout could not be started. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        className={className}
        disabled={isPending}
        onClick={startCheckout}
        type="button"
        variant={variant}
      >
        {isPending ? "Redirecting…" : children}
      </Button>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
