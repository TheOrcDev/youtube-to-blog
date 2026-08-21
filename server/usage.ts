"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { blogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { isAdminEmail } from "@/lib/entitlements/admin";
import {
  type EntitlementTier,
  getLimitsForTier,
  startOfCurrentMonthUtc,
} from "@/lib/entitlements/policy";
import { getUserEntitlementSnapshot } from "@/lib/entitlements/snapshot";

export async function countBlogsCreatedSince(
  userId: string,
  since: Date
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(blogs)
    .where(and(eq(blogs.userId, userId), gte(blogs.createdAt, since)));

  return row?.value ?? 0;
}

export async function getEntitlementTier(
  userId: string
): Promise<{ tier: string }> {
  const snapshot = await getUserEntitlementSnapshot(userId);
  return { tier: snapshot.tier };
}

// Whether the current visitor should see the video upload UI. Signed-out
// visitors see it too (submitting still requires auth); the server action and
// upload route enforce the Pro gate regardless of what the client renders.
export async function canUploadVideos(): Promise<boolean> {
  if (!isBillingEnabled()) {
    return true;
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return true;
  }

  if (isAdminEmail(session.user.email, process.env.ADMIN_EMAILS)) {
    return true;
  }

  const snapshot = await getUserEntitlementSnapshot(session.user.id);

  return getLimitsForTier(snapshot.tier).canUploadVideos;
}

// Whether the signed-in user may save custom style instructions. Generation
// re-checks the tier, so this only controls what the settings UI shows.
export async function canUseCustomStyles(): Promise<boolean> {
  if (!isBillingEnabled()) {
    return true;
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return false;
  }

  if (isAdminEmail(session.user.email, process.env.ADMIN_EMAILS)) {
    return true;
  }

  const snapshot = await getUserEntitlementSnapshot(session.user.id);

  return getLimitsForTier(snapshot.tier).canUseCustomStyles;
}

// Whether the signed-in user may manage API keys. The API itself re-checks the
// tier on every request, so this only controls what the settings UI shows.
export async function canUseApiKeys(): Promise<boolean> {
  if (!isBillingEnabled()) {
    return true;
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return false;
  }

  if (isAdminEmail(session.user.email, process.env.ADMIN_EMAILS)) {
    return true;
  }

  const snapshot = await getUserEntitlementSnapshot(session.user.id);

  return getLimitsForTier(snapshot.tier).canUseApi;
}

export type UsageSummary =
  | { billingEnabled: false }
  | {
      billingEnabled: true;
      cancelAtPeriodEnd: boolean;
      isAdmin: boolean;
      currentPeriodEnd: Date | null;
      hasCreemCustomer: boolean;
      limit: number;
      subscriptionStatus: string;
      tier: EntitlementTier;
      used: number;
    };

// Returns null when nobody is signed in, so callers can render nothing rather
// than redirect (getCurrentUser would redirect to /login).
export async function getUsageSummary(): Promise<UsageSummary | null> {
  if (!isBillingEnabled()) {
    return { billingEnabled: false };
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const snapshot = await getUserEntitlementSnapshot(session.user.id);
  const used = await countBlogsCreatedSince(
    session.user.id,
    startOfCurrentMonthUtc(new Date())
  );

  return {
    billingEnabled: true,
    cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
    currentPeriodEnd: snapshot.currentPeriodEnd,
    hasCreemCustomer: snapshot.hasCreemCustomer,
    isAdmin: isAdminEmail(session.user.email, process.env.ADMIN_EMAILS),
    limit: getLimitsForTier(snapshot.tier).monthlyGenerations,
    subscriptionStatus: snapshot.subscriptionStatus,
    tier: snapshot.tier,
    used,
  };
}
