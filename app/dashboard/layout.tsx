import type { Metadata } from "next";
import { cookies } from "next/headers";
import { type ReactNode, Suspense } from "react";

import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { getCurrentUser } from "@/server/users";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

async function DashboardNavbarFromSession({
  billingEnabled,
}: {
  billingEnabled: boolean;
}) {
  const { user } = await getCurrentUser();

  return (
    <DashboardNavbar
      billingEnabled={billingEnabled}
      email={user.email}
      image={user.image ?? null}
      name={user.name}
    />
  );
}

async function DashboardShell({ children }: { children: ReactNode }) {
  const sidebarState = (await cookies()).get("sidebar_state")?.value;
  const billingEnabled = isBillingEnabled();

  return (
    <SidebarProvider defaultOpen={sidebarState !== "false"}>
      <DashboardSidebar billingEnabled={billingEnabled} />
      <SidebarInset>
        <Suspense
          fallback={
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sm:px-6">
              <Skeleton className="size-9" />
              <Skeleton className="h-5 w-28" />
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="size-8" />
                <Skeleton className="size-9 rounded-full" />
              </div>
            </header>
          }
        >
          <DashboardNavbarFromSession billingEnabled={billingEnabled} />
        </Suspense>
        <div className="flex w-full flex-1 flex-col" id="main-content">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Skeleton className="h-16 w-full" />
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
