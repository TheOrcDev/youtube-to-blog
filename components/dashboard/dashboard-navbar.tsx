"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CommandMenuTrigger } from "@/components/command-menu";
import { getDashboardNavItems } from "@/components/dashboard/dashboard-sidebar";
import { ModeSwitcher } from "@/components/mode-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardNavbar({
  billingEnabled,
  children,
}: {
  billingEnabled: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const title =
    getDashboardNavItems(billingEnabled).find((item) => item.match(pathname))
      ?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 min-w-0 shrink-0 items-center gap-2 border-b bg-background px-4 max-md:pl-16 sm:px-6">
      <SidebarTrigger className="min-h-11 shrink-0 max-md:hidden" />
      <h2 className="min-w-0 flex-1 truncate font-semibold text-base">
        {title}
      </h2>
      <div className="flex shrink-0 items-center gap-2">
        <CommandMenuTrigger />
        <ModeSwitcher />
        {children}
      </div>
    </header>
  );
}
