import { getLimitsForTier } from "../lib/entitlements/policy.ts";
import { asBlogWorkflowError, BlogWorkflowError } from "./blog-errors.ts";

interface ApiAllowanceDependencies {
  getEntitlementTier: (userId: string) => Promise<{ tier: string }>;
  isAdmin: (email: string | null | undefined) => boolean;
  isBillingEnabled: () => boolean;
}

// The public API is a Pro feature. Checked on every request rather than at key
// creation, so downgraded accounts lose access immediately. Self-hosted
// deployments (billing disabled) and admins are never gated.
export function createApiAllowance({
  getEntitlementTier,
  isAdmin,
  isBillingEnabled,
}: ApiAllowanceDependencies) {
  return async function checkApiAllowance(
    userId: string,
    email?: string | null
  ): Promise<void> {
    if (!isBillingEnabled()) {
      return;
    }

    if (isAdmin(email)) {
      return;
    }

    let tier: string;

    try {
      ({ tier } = await getEntitlementTier(userId));
    } catch (error) {
      throw asBlogWorkflowError(error, "UNKNOWN");
    }

    if (!getLimitsForTier(tier).canUseApi) {
      throw new BlogWorkflowError("API_REQUIRES_PRO");
    }
  };
}
