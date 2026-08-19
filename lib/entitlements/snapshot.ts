import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { type SelectUserEntitlement, userEntitlements } from "@/db/schema";
import {
  type EntitlementTier,
  getLimitsForTier,
  normalizeTier,
} from "@/lib/entitlements/policy";

export interface EntitlementSnapshot {
  billingInterval: string;
  cancelAtPeriodEnd: boolean;
  creditsBalance: number;
  currentPeriodEnd: Date | null;
  hasCreemCustomer: boolean;
  monthlyGenerations: number;
  subscriptionStatus: string;
  tier: EntitlementTier;
}

// Every user needs a row before we can read or update entitlements. Neon's HTTP
// driver has no transactions, so this is an insert-if-absent followed by a
// re-select; concurrent callers converge on the same row via onConflictDoNothing.
export async function ensureUserEntitlement(
  userId: string
): Promise<SelectUserEntitlement> {
  const [existing] = await db
    .select()
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, userId));

  if (existing) {
    return existing;
  }

  await db
    .insert(userEntitlements)
    .values({ userId })
    .onConflictDoNothing({ target: userEntitlements.userId });

  const [created] = await db
    .select()
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, userId));

  return created;
}

export function buildEntitlementSnapshot(
  row: SelectUserEntitlement | null
): EntitlementSnapshot {
  const tier = normalizeTier(row?.tier);

  return {
    billingInterval: row?.billingInterval ?? "month",
    cancelAtPeriodEnd: row?.cancelAtPeriodEnd ?? false,
    creditsBalance: row?.creditsBalance ?? 0,
    currentPeriodEnd: row?.currentPeriodEnd ?? null,
    hasCreemCustomer: Boolean(row?.creemCustomerId),
    monthlyGenerations: getLimitsForTier(tier).monthlyGenerations,
    subscriptionStatus: row?.subscriptionStatus ?? "none",
    tier,
  };
}

export async function getUserEntitlementSnapshot(
  userId: string
): Promise<EntitlementSnapshot> {
  const row = await ensureUserEntitlement(userId);
  return buildEntitlementSnapshot(row ?? null);
}
