import {
  FREE_MONTHLY_GENERATIONS,
  PRO_MONTHLY_GENERATIONS,
} from "../entitlements/policy.ts";

export const BILLING_INTERVALS = ["month", "year"] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export function isBillingInterval(value: unknown): value is BillingInterval {
  return (
    typeof value === "string" &&
    BILLING_INTERVALS.includes(value as BillingInterval)
  );
}

export const FREE_PLAN = {
  features: [
    `${FREE_MONTHLY_GENERATIONS} blog generations per month`,
    "Convert from YouTube links",
    "Standard AI model",
    "5 writing style presets",
    "Markdown export",
    "Unlimited blog storage",
  ],
  id: "free",
  name: "Free",
  priceUsd: 0,
} as const;

// Each interval stores the *name* of the env var holding its Creem product id,
// never the id itself, so this module stays pure and testable.
export const PRO_PLAN = {
  features: [
    `${PRO_MONTHLY_GENERATIONS} blog generations per month`,
    "Upload your own videos (up to 64MB)",
    "API access for scripts and pipelines",
    "Custom writing style in your own voice",
    "Premium AI model for richer posts",
    "Markdown export",
    "Priority support",
  ],
  id: "pro",
  intervals: {
    month: {
      billedNote: "Billed monthly",
      label: "Monthly",
      perMonthUsd: 9,
      priceUsd: 9,
      productEnvKey: "CREEM_PRO_PRODUCT_ID",
    },
    year: {
      badge: "2 months free",
      billedNote: "Billed annually",
      label: "Yearly",
      perMonthUsd: 6.58,
      priceUsd: 79,
      productEnvKey: "CREEM_PRO_YEARLY_PRODUCT_ID",
    },
  },
  name: "Pro",
} as const;
