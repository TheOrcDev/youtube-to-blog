import Link from "next/link";

import { getUsageSummary } from "@/server/usage";

export async function UsageIndicator() {
  const summary = await getUsageSummary();

  // Hidden for self-hosted deployments and signed-out visitors.
  if (!summary?.billingEnabled) {
    return null;
  }

  const remaining = Math.max(summary.limit - summary.used, 0);
  const isPro = summary.tier === "pro";

  if (summary.isAdmin) {
    return (
      <p className="mt-3 text-center text-muted-foreground text-sm">
        {summary.used} generations this month · unlimited (admin)
      </p>
    );
  }

  return (
    <p className="mt-3 text-center text-muted-foreground text-sm">
      {summary.used} of {summary.limit} {isPro ? "Pro" : "free"} generations
      used this month
      {isPro ? null : (
        <>
          {" · "}
          <Link className="underline underline-offset-4" href="/pricing">
            {remaining === 0 ? "Upgrade to keep going" : "Upgrade"}
          </Link>
        </>
      )}
    </p>
  );
}
