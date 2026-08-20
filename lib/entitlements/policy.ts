export type EntitlementTier = "free" | "pro";

export const FREE_MONTHLY_GENERATIONS = 5;
export const PRO_MONTHLY_GENERATIONS = 100;

export const FREE_TIER_MODEL = "google/gemini-2.5-flash";
export const PRO_TIER_MODEL = "anthropic/claude-sonnet-4-5";

// The AI Gateway rejects request bodies around ~100MB, and video bytes are
// base64-encoded (4/3 overhead) on the way in. 64MB raw leaves safe headroom.
export const MAX_UPLOAD_BYTES = 64 * 1024 * 1024;

export const SUPPORTED_UPLOAD_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export interface TierLimits {
  canUploadVideos: boolean;
  model: string;
  monthlyGenerations: number;
}

export const TIER_LIMITS: Record<EntitlementTier, TierLimits> = {
  free: {
    canUploadVideos: false,
    model: FREE_TIER_MODEL,
    monthlyGenerations: FREE_MONTHLY_GENERATIONS,
  },
  pro: {
    canUploadVideos: true,
    model: PRO_TIER_MODEL,
    monthlyGenerations: PRO_MONTHLY_GENERATIONS,
  },
};

export function isEntitlementTier(value: unknown): value is EntitlementTier {
  return value === "free" || value === "pro";
}

// Unknown or missing tiers fall back to free so a malformed row can never
// hand out Pro limits.
export function getLimitsForTier(tier: string | null | undefined): TierLimits {
  return isEntitlementTier(tier) ? TIER_LIMITS[tier] : TIER_LIMITS.free;
}

export function normalizeTier(
  tier: string | null | undefined
): EntitlementTier {
  return isEntitlementTier(tier) ? tier : "free";
}

// Quotas reset on the first instant of each UTC month, matching the calendar
// month the usage indicator shows.
export function startOfCurrentMonthUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
