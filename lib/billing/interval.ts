import { getOptionalEnv, getRequiredEnv } from "../env.ts";
import {
  type BillingInterval,
  isBillingInterval,
  PRO_PLAN,
} from "./pricing.ts";

// A missing body or interval means monthly, so upgrade links that predate the
// yearly plan keep working. An explicitly bad value returns null (→ 400).
export function parseCheckoutInterval(rawBody: string): BillingInterval | null {
  if (!rawBody.trim()) {
    return "month";
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return null;
  }

  const interval =
    typeof parsed === "object" && parsed !== null
      ? (parsed as { interval?: unknown }).interval
      : undefined;

  if (interval === undefined) {
    return "month";
  }

  return isBillingInterval(interval) ? interval : null;
}

// The yearly product id can legitimately be absent (not provisioned yet), so
// yearly matching is optional. The monthly id stays required so a misconfigured
// deployment fails loudly instead of silently ignoring every webhook.
export function isProProductId(productId: string | null): boolean {
  if (!productId) {
    return false;
  }

  return (
    productId === getRequiredEnv(PRO_PLAN.intervals.month.productEnvKey) ||
    productId === getOptionalEnv(PRO_PLAN.intervals.year.productEnvKey)
  );
}

export function resolveBillingIntervalForProduct(
  productId: string | null
): BillingInterval {
  if (
    productId &&
    productId === getOptionalEnv(PRO_PLAN.intervals.year.productEnvKey)
  ) {
    return "year";
  }

  if (
    productId &&
    productId !== getOptionalEnv(PRO_PLAN.intervals.month.productEnvKey)
  ) {
    console.warn(
      `Creem product ${productId} matches no configured Pro product id; recording monthly billing.`
    );
  }

  return "month";
}
