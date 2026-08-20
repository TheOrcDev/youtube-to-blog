"use client";

import { type MouseEvent, useCallback } from "react";

import { cn } from "@/lib/utils";

export interface DocsSection {
  href: `#${string}`;
  label: string;
}

export function DocsOnThisPage({
  sections,
}: {
  sections: readonly DocsSection[];
}) {
  const handleSectionClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: DocsSection["href"]) => {
      const target = document.getElementById(href.slice(1));

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", href);
    },
    []
  );

  return (
    <nav aria-label="On this page" className="sticky top-24">
      <p className="mb-3 font-medium text-foreground text-sm">On this page</p>
      <ul className="flex flex-col gap-1 border-l">
        {sections.map((section) => (
          <li key={section.href}>
            <a
              className={cn(
                "block border-transparent border-l px-3 py-1.5 text-muted-foreground text-sm",
                "hover:border-foreground hover:text-foreground",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              )}
              href={section.href}
              onClick={(event) => {
                handleSectionClick(event, section.href);
              }}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
