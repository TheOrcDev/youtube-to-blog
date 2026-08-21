"use client";

import {
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProBadge } from "@/components/dashboard/pro-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAME_SEPARATOR = /\s+/;

function getInitials(name: string, email: string): string {
  const parts = name.trim().split(NAME_SEPARATOR).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  if (parts[0]?.[0]) {
    return parts[0][0].toUpperCase();
  }

  return email[0]?.toUpperCase() ?? "?";
}

export function DashboardUserMenu({
  billingEnabled,
  email,
  image,
  isPro,
  name,
}: {
  billingEnabled: boolean;
  email: string;
  image: string | null;
  isPro: boolean;
  name: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <DropdownMenu>
      {/*
        The badge sits beside the trigger rather than inside it so the
        button's own centring never has to account for an overlay, and it
        stays `pointer-events-none` so the corner it covers still opens the
        menu.
      */}
      <div className="relative flex size-8 shrink-0 items-center justify-center self-center">
        <DropdownMenuTrigger
          aria-label={`Open account menu for ${name || email}${
            isPro ? ", Pro plan" : ""
          }`}
          className={cn(
            buttonVariants({ size: "icon-sm", variant: "ghost" }),
            "rounded-full p-0"
          )}
        >
          <Avatar className="size-8">
            {image ? <AvatarImage alt="" src={image} /> : null}
            <AvatarFallback>{getInitials(name, email)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        {isPro ? <ProBadge /> : null}
      </div>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium text-foreground">
              {name || "Your account"}
            </span>
            <span className="truncate font-normal text-muted-foreground text-xs">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <FileTextIcon />
              My blogs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/new">
              <PlusIcon />
              New blog
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <SettingsIcon />
              Settings
            </Link>
          </DropdownMenuItem>
          {billingEnabled ? (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing">
                <CreditCardIcon />
                Billing
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href="/">
              <HomeIcon />
              Home
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
