import assert from "node:assert/strict";
import test from "node:test";

import { startOfCurrentMonthUtc } from "../lib/entitlements/policy.ts";
import { createGenerationAllowance } from "../server/generation-allowance.ts";

const USER_ID = "user-123";
const NOW = new Date("2026-08-15T10:00:00.000Z");

function buildAllowance({ billingEnabled = true, tier = "free", used = 0 }) {
  const calls = { counts: 0, tiers: 0 };

  const checkGenerationAllowance = createGenerationAllowance({
    countBlogsCreatedSince: (userId, since) => {
      calls.counts += 1;
      calls.since = since;
      calls.userId = userId;
      return Promise.resolve(used);
    },
    getEntitlementTier: () => {
      calls.tiers += 1;
      return Promise.resolve({ tier });
    },
    isBillingEnabled: () => billingEnabled,
    now: () => NOW,
  });

  return { calls, checkGenerationAllowance };
}

test("a self-hosted deployment without billing generates without limits", async () => {
  const { calls, checkGenerationAllowance } = buildAllowance({
    billingEnabled: false,
  });

  const allowance = await checkGenerationAllowance(USER_ID);

  assert.equal(allowance.remaining, null);
  assert.equal(allowance.model, "google/gemini-2.5-flash");
  assert.equal(calls.tiers, 0);
  assert.equal(calls.counts, 0);
});

test("a free user under the monthly limit generates with the standard model", async () => {
  const { calls, checkGenerationAllowance } = buildAllowance({ used: 4 });

  const allowance = await checkGenerationAllowance(USER_ID);

  assert.equal(allowance.remaining, 1);
  assert.equal(allowance.model, "google/gemini-2.5-flash");
  assert.equal(calls.userId, USER_ID);
  assert.deepEqual(calls.since, new Date("2026-08-01T00:00:00.000Z"));
});

test("a free user at the monthly limit is asked to upgrade", async () => {
  const { checkGenerationAllowance } = buildAllowance({ used: 5 });

  await assert.rejects(
    () => checkGenerationAllowance(USER_ID),
    (error) => error.code === "QUOTA_EXCEEDED"
  );
});

test("a pro user gets the premium model and the higher limit", async () => {
  const { checkGenerationAllowance } = buildAllowance({
    tier: "pro",
    used: 99,
  });

  const allowance = await checkGenerationAllowance(USER_ID);

  assert.equal(allowance.remaining, 1);
  assert.equal(allowance.model, "anthropic/claude-sonnet-4-5");
});

test("a pro user at the monthly limit is blocked", async () => {
  const { checkGenerationAllowance } = buildAllowance({
    tier: "pro",
    used: 100,
  });

  await assert.rejects(
    () => checkGenerationAllowance(USER_ID),
    (error) => error.code === "QUOTA_EXCEEDED"
  );
});

test("an unrecognized tier falls back to free limits", async () => {
  const { checkGenerationAllowance } = buildAllowance({
    tier: "enterprise",
    used: 5,
  });

  await assert.rejects(
    () => checkGenerationAllowance(USER_ID),
    (error) => error.code === "QUOTA_EXCEEDED"
  );
});

test("quota windows start at the first instant of the UTC month", () => {
  assert.deepEqual(
    startOfCurrentMonthUtc(new Date("2026-01-01T00:00:00.000Z")),
    new Date("2026-01-01T00:00:00.000Z")
  );
  assert.deepEqual(
    startOfCurrentMonthUtc(new Date("2026-12-31T23:59:59.999Z")),
    new Date("2026-12-01T00:00:00.000Z")
  );
});
