import type { Metadata } from "next";
import { Suspense } from "react";

import { BillingSummary } from "@/components/billing/billing-summary";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  description: "Manage your YouTube to Blog subscription and monthly usage.",
  title: "Billing",
};

interface BillingPageProps {
  searchParams: Promise<{ checkout?: string }>;
}

async function BillingSummaryFromParams({ searchParams }: BillingPageProps) {
  const { checkout } = await searchParams;

  return <BillingSummary checkout={checkout} />;
}

export default function DashboardBillingPage({
  searchParams,
}: BillingPageProps) {
  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Manage your subscription and monthly generation usage."
        eyebrow="Account"
        title="Billing"
      />
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <BillingSummaryFromParams searchParams={searchParams} />
      </Suspense>
    </DashboardPageShell>
  );
}
