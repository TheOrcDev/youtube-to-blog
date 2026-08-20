"use client";

import { usePathname } from "next/navigation";
import { CommandMenuTrigger } from "@/components/command-menu";
import { getDashboardNavItems } from "@/components/dashboard/dashboard-sidebar";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { ModeSwitcher } from "@/components/mode-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardNavbar({
  billingEnabled,
  email,
  image,
  name,
}: {
  billingEnabled: boolean;
  email: string;
  image: string | null;
  name: string;
}) {
  const pathname = usePathname();
  const title =
    getDashboardNavItems(billingEnabled).find((item) => item.match(pathname))
      ?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="min-h-11 max-md:hidden" />
      <h2 className="min-w-0 flex-1 truncate font-semibold text-base">
        {title}
      </h2>
      <CommandMenuTrigger />
      <ModeSwitcher />
      <DashboardUserMenu
        billingEnabled={billingEnabled}
        email={email}
        image={image}
        name={name}
      />
    </header>
  );
}
