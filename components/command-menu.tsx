"use client";

import {
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  InfoIcon,
  KeyIcon,
  LogInIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  UserPlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  { href: "/why", icon: InfoIcon, label: "Why multiple blog posts?" },
  { href: "/dashboard", icon: FileTextIcon, label: "My blogs" },
  { href: "/dashboard/api-keys", icon: KeyIcon, label: "API keys" },
  { href: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
  { href: "/login", icon: LogInIcon, label: "Log in" },
  { href: "/signup", icon: UserPlusIcon, label: "Sign up" },
] as const;

const billingNavigationItems = [
  { href: "/pricing", icon: SparklesIcon, label: "Pricing" },
  { href: "/dashboard/billing", icon: CreditCardIcon, label: "Billing" },
] as const;

interface CommandMenuContextValue {
  billingEnabled: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

function useCommandMenu() {
  const context = useContext(CommandMenuContext);

  if (!context) {
    throw new Error(
      "Command menu components must be used within CommandMenuProvider."
    );
  }

  return context;
}

export function CommandMenuProvider({
  billingEnabled = false,
  children,
}: {
  billingEnabled?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({ billingEnabled, open, setOpen }),
    [billingEnabled, open]
  );

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

  return (
    <CommandMenuContext.Provider value={value}>
      {children}
      <CommandMenuDialog />
    </CommandMenuContext.Provider>
  );
}

export function CommandMenuTrigger() {
  const { setOpen } = useCommandMenu();

  return (
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
  );
}

function CommandMenuDialog() {
  const { billingEnabled, open, setOpen } = useCommandMenu();
  const router = useRouter();
  const items = billingEnabled
    ? [...navigationItems, ...billingNavigationItems]
    : navigationItems;

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
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
  );
}
