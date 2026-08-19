"use client";

import {
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  InfoIcon,
  LogInIcon,
  SearchIcon,
  SparklesIcon,
  UserPlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

const navigationItems = [
  { href: "/", icon: HomeIcon, label: "Create a blog", shortcut: "G H" },
  { href: "/why", icon: InfoIcon, label: "Why multiple blogs?" },
  { href: "/blogs", icon: FileTextIcon, label: "My blogs" },
  { href: "/login", icon: LogInIcon, label: "Log in" },
  { href: "/signup", icon: UserPlusIcon, label: "Sign up" },
] as const;

const billingNavigationItems = [
  { href: "/pricing", icon: SparklesIcon, label: "Pricing" },
  { href: "/account/billing", icon: CreditCardIcon, label: "Billing" },
] as const;

export function CommandMenu({
  billingEnabled = false,
}: {
  billingEnabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = billingEnabled
    ? [...navigationItems, ...billingNavigationItems]
    : navigationItems;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        aria-label="Open command menu"
        onClick={() => setOpen(true)}
        size="icon-sm"
        title="Open command menu (Cmd/Ctrl+K)"
        type="button"
        variant="ghost"
      >
        <SearchIcon aria-hidden="true" />
      </Button>
      <CommandDialog
        description="Search pages and actions"
        onOpenChange={setOpen}
        open={open}
        title="Navigate YouTube to Blog"
      >
        <CommandInput placeholder="Search pages and actions..." />
        <CommandList>
          <CommandEmpty>No matching page or action.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <CommandItem
                  key={item.href}
                  onSelect={() => navigate(item.href)}
                  value={item.label}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                  {"shortcut" in item && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
