import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BillingSummary } from "@/components/billing/billing-summary";
import { Button } from "@/components/ui/button";
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

export default function BillingPage({ searchParams }: BillingPageProps) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Button
        asChild
        className="absolute top-4 left-1/2 mx-auto -translate-x-1/2"
        variant="outline"
      >
        <Link href="/">Back</Link>
      </Button>

      <h1 className="mb-6 font-bold text-3xl">Billing</h1>

      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <BillingSummaryFromParams searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
