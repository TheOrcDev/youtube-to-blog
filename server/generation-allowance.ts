import {
  getLimitsForTier,
  PRO_TIER_MODEL,
  startOfCurrentMonthUtc,
} from "../lib/entitlements/policy.ts";
import { asBlogWorkflowError, BlogWorkflowError } from "./blog-errors.ts";

export interface GenerationAllowance {
  model: string;
  // null means unlimited: billing is disabled, or the user is an admin.
  remaining: number | null;
}

interface GenerationAllowanceDependencies {
  countBlogsCreatedSince: (userId: string, since: Date) => Promise<number>;
  getEntitlementTier: (userId: string) => Promise<{ tier: string }>;
  isAdmin: (email: string | null | undefined) => boolean;
  isBillingEnabled: () => boolean;
  now?: () => Date;
}

export function createGenerationAllowance({
  countBlogsCreatedSince,
  getEntitlementTier,
  isAdmin,
  isBillingEnabled,
  now = () => new Date(),
}: GenerationAllowanceDependencies) {
  return async function checkGenerationAllowance(
    userId: string,
    email?: string | null
  ): Promise<GenerationAllowance> {
    // Self-hosted deployments skip the lookups entirely.
    if (!isBillingEnabled()) {
      return { model: getLimitsForTier("free").model, remaining: null };
    }

    // Admins are never metered and always get the premium model. Checked before
    // any lookup so it holds even if the entitlement row is missing.
    if (isAdmin(email)) {
      return { model: PRO_TIER_MODEL, remaining: null };
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
