"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { blogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing/enabled";
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

export type UsageSummary =
  | { billingEnabled: false }
  | {
      billingEnabled: true;
      cancelAtPeriodEnd: boolean;
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
    limit: getLimitsForTier(snapshot.tier).monthlyGenerations,
    subscriptionStatus: snapshot.subscriptionStatus,
    tier: snapshot.tier,
    used,
  };
}
