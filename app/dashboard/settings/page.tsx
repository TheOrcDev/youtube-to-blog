import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ApiKeysCard } from "@/components/dashboard/api-keys-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { SettingsForm } from "@/components/forms/settings-form";
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
import { getAccountSettings } from "@/server/users";

export const metadata: Metadata = {
  description: "Update your photo, username, and password.",
  title: "Settings",
};

async function SettingsFormFromSession() {
  const settings = await getAccountSettings();

  return <SettingsForm settings={settings} />;
}

async function ApiKeysSection() {
  const allowed = await canUseApiKeys();

  if (allowed) {
    return <ApiKeysCard />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <CardDescription>
          API access is a Pro feature. Upgrade to generate blog posts
          programmatically from your own scripts and pipelines.
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

export default function DashboardSettingsPage() {
  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Change your photo, username, and password."
        eyebrow="Account"
        title="Settings"
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <SettingsFormFromSession />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ApiKeysSection />
      </Suspense>
    </DashboardPageShell>
  );
}
