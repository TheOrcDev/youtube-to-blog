import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import {
  creemWebhookEvents,
  entitlementEvents,
  type InsertUserEntitlement,
  userEntitlements,
} from "@/db/schema";
import type { BillingInterval } from "@/lib/billing/pricing";
import type { EntitlementTier } from "@/lib/entitlements/policy";

export interface EntitlementMutationResult {
  beforeTier: string | null;
}

interface SetEntitlementParams {
  billingInterval?: BillingInterval;
  cancelAtPeriodEnd?: boolean;
  creemCustomerId?: string | null;
  creemProductId?: string | null;
  creemSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
  eventType: string;
  source: string;
  subscriptionStatus: string;
  tier: EntitlementTier;
  userId: string;
}

function toJson(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value)) as unknown;
}

// Returns false when this event was already fully processed, so callers can
// skip redelivered webhooks without re-applying their side effects.
export async function recordWebhookEvent(params: {
  eventId: string;
  eventType: string;
  payload: unknown;
}): Promise<boolean> {
  const [existing] = await db
    .select({ result: creemWebhookEvents.result })
    .from(creemWebhookEvents)
    .where(eq(creemWebhookEvents.creemEventId, params.eventId))
    .limit(1);

  if (existing?.result === "processed") {
    return false;
  }

  const payloadJson = toJson(params.payload);

  if (existing) {
    await db
      .update(creemWebhookEvents)
      .set({
        eventType: params.eventType,
        payloadJson,
        processedAt: null,
        result: "processing",
      })
      .where(eq(creemWebhookEvents.creemEventId, params.eventId));

    return true;
  }

  await db.insert(creemWebhookEvents).values({
    creemEventId: params.eventId,
    eventType: params.eventType,
    payloadJson,
    result: "processing",
  });

  return true;
}

export async function markWebhookProcessed(eventId: string): Promise<void> {
  await db
    .update(creemWebhookEvents)
    .set({ processedAt: new Date(), result: "processed" })
    .where(eq(creemWebhookEvents.creemEventId, eventId));
}

export async function setUserEntitlement(
  params: SetEntitlementParams
): Promise<EntitlementMutationResult> {
  const [before] = await db
    .select()
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, params.userId))
    .limit(1);

  const values: InsertUserEntitlement = {
    billingInterval: params.billingInterval ?? "month",
    cancelAtPeriodEnd: params.cancelAtPeriodEnd ?? false,
    creemCustomerId: params.creemCustomerId ?? null,
    creemProductId: params.creemProductId ?? null,
    creemSubscriptionId: params.creemSubscriptionId ?? null,
    currentPeriodEnd: params.currentPeriodEnd ?? null,
    source: params.source,
    subscriptionStatus: params.subscriptionStatus,
    tier: params.tier,
    userId: params.userId,
  };

  const { userId: _userId, ...setValues } = values;

  await db.insert(userEntitlements).values(values).onConflictDoUpdate({
    set: setValues,
    target: userEntitlements.userId,
  });

  const [after] = await db
    .select()
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, params.userId))
    .limit(1);

  await db.insert(entitlementEvents).values({
    afterJson: toJson(after ?? null),
    beforeJson: toJson(before ?? null),
    eventType: params.eventType,
    source: params.source,
    userId: params.userId,
  });

  return { beforeTier: before?.tier ?? null };
}
