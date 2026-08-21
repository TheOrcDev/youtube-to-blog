import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const panel = "rounded-lg border bg-card";

export interface Card11Line {
  amount: string;
  detail: string;
  id: string;
  label: string;
}

export interface Card11Total {
  id: string;
  label: string;
  value: string;
}

export function Card11({
  action,
  eyebrow,
  lines,
  meta,
  status,
  title,
  totalLabel,
  totalValue,
  totals,
}: {
  action: ReactNode;
  eyebrow: string;
  lines: Card11Line[];
  meta: string;
  status: string;
  title: string;
  totalLabel: string;
  totalValue: string;
  totals: Card11Total[];
}) {
  return (
    <article className="flex h-full flex-col gap-1 rounded-2xl border bg-muted p-1">
      <div className={cn(panel, "p-4")}>
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {eyebrow}
        </p>

        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h2 className="min-w-0 truncate font-medium text-base tracking-tight">
            {title}
          </h2>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-primary"
            />
            {status}
          </span>
        </div>

        <p className="mt-1 truncate text-muted-foreground text-xs">{meta}</p>
      </div>

      <div className={cn(panel, "flex-1 px-2 py-1")}>
        <ul className="divide-y divide-border">
          {lines.map((line) => (
            <li
              className="flex items-center justify-between gap-3 px-2 py-2.5"
              key={line.id}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px]">{line.label}</span>
                <span className="mt-0.5 block truncate text-muted-foreground text-xs tabular-nums">
                  {line.detail}
                </span>
              </span>
              <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
                {line.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <dl className={cn(panel, "flex flex-col gap-1.5 px-4 py-3")}>
        {totals.map((row) => (
          <div className="flex items-center justify-between gap-3" key={row.id}>
            <dt className="text-[13px] text-muted-foreground">{row.label}</dt>
            <dd className="text-[13px] text-muted-foreground tabular-nums">
              {row.value}
            </dd>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-3 pt-1.5">
          <dt className="font-medium text-[13px]">{totalLabel}</dt>
          <dd className="font-medium text-base tabular-nums tracking-tight">
            {totalValue}
          </dd>
        </div>
      </dl>

      <div className="rounded-lg border bg-card p-3">{action}</div>
    </article>
  );
}
