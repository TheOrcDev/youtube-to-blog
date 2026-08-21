import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { SettingsForm } from "@/components/forms/settings-form";
import { WritingStyleForm } from "@/components/forms/writing-style-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getWritingPreferences } from "@/server/user-preferences";
import { getAccountSettings } from "@/server/users";

export const metadata: Metadata = {
  description: "Update your photo, username, and password.",
  title: "Settings",
};

async function SettingsFormFromSession() {
  const settings = await getAccountSettings();

  return <SettingsForm settings={settings} />;
}

async function WritingStyleFromSession() {
  const preferences = await getWritingPreferences();

  if (!preferences) {
    return null;
  }

  return <WritingStyleForm preferences={preferences} />;
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
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <WritingStyleFromSession />
      </Suspense>
    </DashboardPageShell>
  );
}
