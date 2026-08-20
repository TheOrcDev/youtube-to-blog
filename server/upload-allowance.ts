import { getLimitsForTier } from "../lib/entitlements/policy.ts";
import { asBlogWorkflowError, BlogWorkflowError } from "./blog-errors.ts";

interface UploadAllowanceDependencies {
  getEntitlementTier: (userId: string) => Promise<{ tier: string }>;
  isAdmin: (email: string | null | undefined) => boolean;
  isBillingEnabled: () => boolean;
}

// Video uploads are a Pro feature. Self-hosted deployments (billing disabled)
// and admins are never gated.
export function createUploadAllowance({
  getEntitlementTier,
  isAdmin,
  isBillingEnabled,
}: UploadAllowanceDependencies) {
  return async function checkUploadAllowance(
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

    if (!getLimitsForTier(tier).canUploadVideos) {
      throw new BlogWorkflowError("UPLOAD_REQUIRES_PRO");
    }
  };
}
