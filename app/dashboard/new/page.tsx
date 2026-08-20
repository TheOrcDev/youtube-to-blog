import type { Metadata } from "next";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { MainForm } from "@/components/forms/main-form";

export const metadata: Metadata = {
  title: "New blog",
};

export default function NewBlogPage() {
  return (
    <DashboardPageShell>
      <DashboardPageHeader
        description="Paste a YouTube link and we will write the article."
        eyebrow="Create"
        title="New blog"
      />
      <MainForm />
    </DashboardPageShell>
  );
}
