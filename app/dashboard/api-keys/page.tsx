import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ApiKeysCard } from "@/components/dashboard/api-keys-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { canUseApiKeys } from "@/server/usage";

export const metadata: Metadata = {
  description: "Create and manage API keys for the blog generation API.",
  title: "API keys",
};

async function ApiKeysSection() {
  const allowed = await canUseApiKeys();

  if (allowed) {
    return <ApiKeysCard />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API access is a Pro feature</CardTitle>
        <CardDescription>
          Upgrade to generate blog posts programmatically from your own scripts
          and pipelines.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Button asChild>
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/docs/api">Read the API docs</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardApiKeysPage() {
  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Generate and fetch blog posts over the REST API."
        eyebrow="Developers"
        title="API keys"
      />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ApiKeysSection />
      </Suspense>
    </DashboardPageShell>
  );
}
