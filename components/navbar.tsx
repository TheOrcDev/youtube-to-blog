"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import type { Variants } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CommandMenuTrigger } from "@/components/command-menu";
import { Logo } from "@/components/logo";
import { ModeSwitcher } from "@/components/mode-switcher";
import { UserButton } from "@/components/user-button";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const GITHUB_URL = "https://github.com/TheOrcDev/youtube-to-blog";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function getNavItems(billingEnabled: boolean) {
  const items = [{ href: "/why", label: "Why Multiple Blogs?" }];

  if (billingEnabled) {
    items.push({ href: "/pricing", label: "Pricing" });
  }

  return items;
}

function GitHubLink({ className }: { className?: string }) {
  return (
    <Link
      aria-label="View source on GitHub"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        focusRing,
        className
      )}
      href={GITHUB_URL}
      rel="noopener noreferrer"
      target="_blank"
    >
      <svg
        aria-hidden="true"
        className="size-4 fill-current"
        viewBox="0 0 24 24"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    </Link>
  );
}

export function Navbar({ billingEnabled }: { billingEnabled: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();
  const items = getNavItems(billingEnabled);
  const activeHref = items.find((item) => item.href === pathname)?.href;
  const current = hovered ?? activeHref;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false);
      }
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const drawerStagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: shouldReduceMotion ? 0 : 0.2,
        staggerChildren: 0.06,
      },
    },
  };

  const drawerItem: Variants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, transition: { duration: 0.45, ease: EASE }, x: 0 },
  };

  return (
    <>
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 right-0 left-0 z-50 border-border border-b bg-background/80 backdrop-blur-md"
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <nav aria-label="Primary">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link
              aria-label="YouTube to Blog home"
              className={cn("flex shrink-0 items-center rounded-sm", focusRing)}
              href="/"
            >
              <Logo size={36} />
            </Link>

            {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative hover reset on a container of links */}
            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative hover reset on a container of links */}
            <div
              className="hidden items-center gap-8 md:flex"
              onMouseLeave={() => setHovered(null)}
            >
              {items.map((item) => (
                <Link
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "relative rounded-sm py-2 font-medium text-sm transition-colors duration-200",
                    focusRing,
                    current === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                  href={item.href}
                  key={item.href}
                  onBlur={() => setHovered(null)}
                  onFocus={() => setHovered(item.href)}
                  onMouseEnter={() => setHovered(item.href)}
                >
                  {item.label}
                  {current === item.href ? (
                    <motion.span
                      className="absolute inset-x-0 bottom-0 h-px bg-foreground"
                      layoutId="navbar-underline"
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  ) : null}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-1 md:flex">
              <CommandMenuTrigger />
              <GitHubLink />
              <ModeSwitcher />
              <UserButton />
            </div>

            <button
              aria-controls="navbar-drawer"
              aria-expanded={open}
              aria-label="Open menu"
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center rounded-full border text-foreground transition-colors duration-200 hover:bg-muted md:hidden",
                focusRing
              )}
              onClick={() => setOpen(true)}
              type="button"
            >
              <Menu />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              animate={{ opacity: 1 }}
              aria-hidden="true"
              className="fixed inset-0 z-[120] bg-foreground/40 backdrop-blur-[2px] md:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              transition={{ duration: 0.25, ease: EASE }}
            />
            <motion.aside
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
              aria-label="Menu"
              aria-modal="true"
              className="fixed inset-0 z-[130] flex w-full flex-col overflow-y-auto bg-background px-6 pt-5 pb-8 md:hidden"
              exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
              id="navbar-drawer"
              initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
              role="dialog"
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.5,
                ease: EASE,
              }}
            >
              <div className="flex items-center justify-between border-border border-b pb-5">
                <Logo size={36} />
                <button
                  aria-label="Close menu"
                  className={cn(
                    "flex size-10 cursor-pointer items-center justify-center rounded-full border text-foreground transition-colors duration-200 hover:bg-muted",
                    focusRing
                  )}
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X />
                </button>
              </div>

              <motion.nav
                animate="visible"
                aria-label="Menu links"
                className="mt-8 flex flex-col"
                initial="hidden"
                variants={drawerStagger}
              >
                <motion.p
                  className="font-medium text-muted-foreground text-xs uppercase tracking-[0.2em]"
                  variants={drawerItem}
                >
                  Menu
                </motion.p>
                {items.map((item) => (
                  <motion.div key={item.href} variants={drawerItem}>
                    <Link
                      className={cn(
                        "group flex items-center justify-between border-border border-b py-4",
                        focusRing
                      )}
                      href={item.href}
                      onClick={() => setOpen(false)}
                    >
                      <span className="font-semibold text-2xl text-foreground tracking-tight transition-colors duration-200 group-hover:text-muted-foreground">
                        {item.label}
                      </span>
                      <ArrowUpRight className="text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div
                animate={{ opacity: 1 }}
                className="mt-auto flex flex-col gap-4 pt-10"
                initial={{ opacity: 0 }}
                transition={{
                  delay: shouldReduceMotion ? 0.1 : 0.5,
                  duration: 0.5,
                  ease: EASE,
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <CommandMenuTrigger />
                  <GitHubLink />
                  <ModeSwitcher />
                  <UserButton />
                </div>
                <Link
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground text-sm transition-colors duration-200 hover:bg-primary/90",
                    focusRing
                  )}
                  href="/"
                  onClick={() => setOpen(false)}
                >
                  Create a blog
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </motion.div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
