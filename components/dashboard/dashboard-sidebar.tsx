"use client";

import {
  CreditCardIcon,
  FileTextIcon,
  type LucideIcon,
  PlusIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export interface DashboardNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  match: (pathname: string) => boolean;
}

export function getDashboardNavItems(
  billingEnabled: boolean
): DashboardNavItem[] {
  const items: DashboardNavItem[] = [
    {
      href: "/dashboard",
      icon: FileTextIcon,
      label: "My blogs",
      match: (pathname) => pathname === "/dashboard",
    },
    {
      href: "/dashboard/new",
      icon: PlusIcon,
      label: "New blog",
      match: (pathname) => pathname.startsWith("/dashboard/new"),
    },
  ];

  if (billingEnabled) {
    items.push({
      href: "/dashboard/billing",
      icon: CreditCardIcon,
      label: "Billing",
      match: (pathname) => pathname.startsWith("/dashboard/billing"),
    });
  }

  return items;
}

export function DashboardSidebar({
  billingEnabled,
}: {
  billingEnabled: boolean;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const items = getDashboardNavItems(billingEnabled);

  return (
    <>
      <SidebarTrigger className="absolute top-4 left-4 z-50 md:hidden" />
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 justify-center border-b">
          <Link
            aria-label="YouTube to Blog dashboard"
            className="flex min-h-11 items-center gap-2 px-2"
            href="/dashboard"
          >
            <Image
              alt=""
              className="size-7"
              height={28}
              src="/youtube-to-blog-logo.png"
              width={28}
            />
            {isCollapsed ? null : (
              <span className="truncate font-semibold text-sm">
                YouTube to Blog
              </span>
            )}
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const ItemIcon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.match(pathname)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <ItemIcon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
