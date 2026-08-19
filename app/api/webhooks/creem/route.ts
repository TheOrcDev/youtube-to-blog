import {
  type FlatDisputeCreated,
  type FlatRefundCreated,
  type FlatSubscriptionEvent,
  Webhook,
} from "@creem_io/nextjs";
import type { NextRequest } from "next/server";

import { isBillingEnabled } from "@/lib/billing/enabled";
import {
  isProProductId,
  resolveBillingIntervalForProduct,
} from "@/lib/billing/interval";
import type { BillingInterval } from "@/lib/billing/pricing";
import {
  markWebhookProcessed,
  recordWebhookEvent,
  setUserEntitlement,
} from "@/lib/entitlements/mutations";
import { ensureUserEntitlement } from "@/lib/entitlements/snapshot";
import { getRequiredEnv } from "@/lib/env";

const SOURCE = "creem";

interface EventBase {
  webhookEventType: string;
  webhookId: string;
}

interface EntitlementUpdate {
  billingInterval?: BillingInterval;
  cancelAtPeriodEnd?: boolean;
  creemCustomerId?: string | null;
  creemProductId?: string | null;
  creemSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
  subscriptionStatus: string;
  tier: "free" | "pro";
}

// Creem redelivers webhooks on any non-2xx response, so each event is recorded
// before its side effects run and marked processed only once they succeed.
async function processOnce<T extends EventBase>(
  event: T,
  handler: () => Promise<void>
): Promise<void> {
  const shouldProcess = await recordWebhookEvent({
    eventId: event.webhookId,
    eventType: event.webhookEventType,
    payload: event,
  });

  if (!shouldProcess) {
    return;
  }

  await handler();
  await markWebhookProcessed(event.webhookId);
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getMetadataUserId(
  metadata: Record<string, unknown> | null | undefined
): string | null {
  const referenceId = metadata?.referenceId ?? metadata?.userId;

  return typeof referenceId === "string" && referenceId ? referenceId : null;
}

function entityId(value: { id: string } | string | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

async function applyEntitlement(params: {
  eventType: string;
  update: EntitlementUpdate;
  userId: string;
}): Promise<void> {
  await ensureUserEntitlement(params.userId);

  await setUserEntitlement({
    ...params.update,
    eventType: params.eventType,
    source: SOURCE,
    userId: params.userId,
  });
}

function subscriptionUpdate(
  event: FlatSubscriptionEvent<string>,
  overrides: Pick<EntitlementUpdate, "subscriptionStatus" | "tier">
): EntitlementUpdate {
  const productId = event.product.id;

  return {
    ...overrides,
    billingInterval: resolveBillingIntervalForProduct(productId),
    cancelAtPeriodEnd: Boolean(event.canceled_at),
    creemCustomerId: event.customer.id,
    creemProductId: productId,
    creemSubscriptionId: event.id,
    currentPeriodEnd: toDate(event.current_period_end_date),
  };
}

// Subscription events carry the full product/customer objects, so tier changes
// are applied directly. Unknown products are ignored: they belong to other
// product lines (future credit packs branch here).
function handleSubscriptionEvent(
  overrides: Pick<EntitlementUpdate, "subscriptionStatus" | "tier">
) {
  return async (event: FlatSubscriptionEvent<string>) => {
    await processOnce(event, async () => {
      if (!isProProductId(event.product.id)) {
        return;
      }

      const userId = getMetadataUserId(event.metadata);

      if (!userId) {
        throw new Error(
          `Creem ${event.webhookEventType} ${event.webhookId} has no referenceId metadata; cannot resolve a user.`
        );
      }

      await applyEntitlement({
        eventType: event.webhookEventType,
        update: subscriptionUpdate(event, overrides),
        userId,
      });
    });
  };
}

// Refunds and disputes only reference the subscription, so they revoke access
// without trying to reconstruct billing details.
function handleRevocation(status: string) {
  return async (event: FlatRefundCreated | FlatDisputeCreated) => {
    await processOnce(event, async () => {
      const subscriptionId = entityId(event.subscription);
      const userId = getMetadataUserId(
        typeof event.subscription === "object" && event.subscription
          ? event.subscription.metadata
          : null
      );

      if (!userId) {
        console.warn(
          `Creem ${event.webhookEventType} ${event.webhookId} has no resolvable user; skipping.`
        );
        return;
      }

      await applyEntitlement({
        eventType: event.webhookEventType,
        update: {
          creemCustomerId: entityId(event.customer),
          creemSubscriptionId: subscriptionId,
          subscriptionStatus: status,
          tier: "free",
        },
        userId,
      });
    });
  };
}

let handler: ((request: NextRequest) => Promise<Response>) | null = null;

function getHandler() {
  if (!handler) {
    handler = Webhook({
      onCheckoutCompleted: async (event) => {
        await processOnce(event, async () => {
          if (!isProProductId(event.product.id)) {
            return;
          }

          const userId = getMetadataUserId(event.metadata);

          if (!userId) {
            throw new Error(
              `Creem checkout.completed ${event.webhookId} has no referenceId metadata; cannot resolve a user.`
            );
          }

          const subscription = event.subscription;

          await applyEntitlement({
            eventType: event.webhookEventType,
            update: {
              billingInterval: resolveBillingIntervalForProduct(
                event.product.id
              ),
              cancelAtPeriodEnd: Boolean(subscription?.canceled_at),
              creemCustomerId: event.customer?.id ?? null,
              creemProductId: event.product.id,
              creemSubscriptionId: subscription?.id ?? null,
              currentPeriodEnd: toDate(subscription?.current_period_end_date),
              subscriptionStatus: subscription?.status ?? "paid",
              tier: "pro",
            },
            userId,
          });
        });
      },
      onDisputeCreated: handleRevocation("disputed"),
      onRefundCreated: handleRevocation("refunded"),
      onSubscriptionActive: handleSubscriptionEvent({
        subscriptionStatus: "active",
        tier: "pro",
      }),
      onSubscriptionCanceled: handleSubscriptionEvent({
        subscriptionStatus: "canceled",
        tier: "free",
      }),
      onSubscriptionExpired: handleSubscriptionEvent({
        subscriptionStatus: "expired",
        tier: "free",
      }),
      onSubscriptionPaid: handleSubscriptionEvent({
        subscriptionStatus: "paid",
        tier: "pro",
      }),
      // A failed payment keeps Pro during Creem's retry window; expiry or
      // cancellation is what actually downgrades the account.
      onSubscriptionPastDue: handleSubscriptionEvent({
        subscriptionStatus: "past_due",
        tier: "pro",
      }),
      onSubscriptionPaused: handleSubscriptionEvent({
        subscriptionStatus: "paused",
        tier: "free",
      }),
      onSubscriptionTrialing: handleSubscriptionEvent({
        subscriptionStatus: "trialing",
        tier: "pro",
      }),
      onSubscriptionUnpaid: handleSubscriptionEvent({
        subscriptionStatus: "unpaid",
        tier: "free",
      }),
      webhookSecret: getRequiredEnv("CREEM_WEBHOOK_SECRET"),
    });
  }

  return handler;
}

export async function POST(request: NextRequest) {
  if (!isBillingEnabled()) {
    return new Response("Billing is not enabled on this deployment.", {
      status: 404,
    });
  }

  return await getHandler()(request);
}
