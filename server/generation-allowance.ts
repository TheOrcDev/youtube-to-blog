import {
  getLimitsForTier,
  startOfCurrentMonthUtc,
} from "../lib/entitlements/policy.ts";
import { asBlogWorkflowError, BlogWorkflowError } from "./blog-errors.ts";

export interface GenerationAllowance {
  model: string;
  // null means unlimited (billing disabled on this deployment).
  remaining: number | null;
}

interface GenerationAllowanceDependencies {
  countBlogsCreatedSince: (userId: string, since: Date) => Promise<number>;
  getEntitlementTier: (userId: string) => Promise<{ tier: string }>;
  isBillingEnabled: () => boolean;
  now?: () => Date;
}

export function createGenerationAllowance({
  countBlogsCreatedSince,
  getEntitlementTier,
  isBillingEnabled,
  now = () => new Date(),
}: GenerationAllowanceDependencies) {
  return async function checkGenerationAllowance(
    userId: string
  ): Promise<GenerationAllowance> {
    // Self-hosted deployments skip the lookups entirely.
    if (!isBillingEnabled()) {
      return { model: getLimitsForTier("free").model, remaining: null };
    }

    let tier: string;

    try {
      ({ tier } = await getEntitlementTier(userId));
    } catch (error) {
      throw asBlogWorkflowError(error, "UNKNOWN");
    }

    const limits = getLimitsForTier(tier);

    let used: number;

    try {
      used = await countBlogsCreatedSince(
        userId,
        startOfCurrentMonthUtc(now())
      );
    } catch (error) {
      throw asBlogWorkflowError(error, "UNKNOWN");
    }

    if (used >= limits.monthlyGenerations) {
      throw new BlogWorkflowError("QUOTA_EXCEEDED");
    }

    return {
      model: limits.model,
      remaining: limits.monthlyGenerations - used,
    };
  };
}
