import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { SettingsForm } from "@/components/forms/settings-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccountSettings } from "@/server/users";

export const metadata: Metadata = {
  description: "Update your username and review the email on your account.",
  title: "Settings",
};

async function SettingsFormFromSession() {
  const settings = await getAccountSettings();

  return <SettingsForm settings={settings} />;
}

export default function DashboardSettingsPage() {
  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Change your username and see the email on this account."
        eyebrow="Account"
        title="Settings"
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <SettingsFormFromSession />
      </Suspense>
    </DashboardPageShell>
  );
}
