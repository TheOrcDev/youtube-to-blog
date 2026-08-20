import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";

import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { getUserEntitlementSnapshot } from "@/lib/entitlements/snapshot";
import { getCurrentUser } from "@/server/users";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

async function DashboardUserMenuFromSession({
  billingEnabled,
}: {
  billingEnabled: boolean;
}) {
  const { user } = await getCurrentUser();
  const isPro =
    billingEnabled &&
    (await getUserEntitlementSnapshot(user.id)).tier === "pro";

  return (
    <DashboardUserMenu
      billingEnabled={billingEnabled}
      email={user.email}
      image={user.image ?? null}
      isPro={isPro}
      name={user.name}
    />
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const billingEnabled = isBillingEnabled();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar billingEnabled={billingEnabled} />
        <SidebarInset>
          <DashboardNavbar billingEnabled={billingEnabled}>
            <Suspense fallback={<Skeleton className="size-9 rounded-full" />}>
              <DashboardUserMenuFromSession billingEnabled={billingEnabled} />
            </Suspense>
          </DashboardNavbar>
          <div className="flex w-full flex-1 flex-col" id="main-content">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
