import assert from "node:assert/strict";
import test from "node:test";

import { createApiAllowance } from "../server/api-allowance.ts";

function makeDependencies(overrides = {}) {
  return {
    getEntitlementTier: () => Promise.resolve({ tier: "free" }),
    isAdmin: () => false,
    isBillingEnabled: () => true,
    ...overrides,
  };
}

test("pro users may use the API", async () => {
  const checkApiAllowance = createApiAllowance(
    makeDependencies({
      getEntitlementTier: () => Promise.resolve({ tier: "pro" }),
    })
  );

  await assert.doesNotReject(checkApiAllowance("user-1"));
});

test("free users are rejected with API_REQUIRES_PRO", async () => {
  const checkApiAllowance = createApiAllowance(makeDependencies());

  await assert.rejects(checkApiAllowance("user-1"), {
    code: "API_REQUIRES_PRO",
  });
});

test("unknown tiers are treated as free", async () => {
  const checkApiAllowance = createApiAllowance(
    makeDependencies({
      getEntitlementTier: () => Promise.resolve({ tier: "banana" }),
    })
  );

  await assert.rejects(checkApiAllowance("user-1"), {
    code: "API_REQUIRES_PRO",
  });
});

test("self-hosted deployments skip the gate entirely", async () => {
  let lookedUp = false;

  const checkApiAllowance = createApiAllowance(
    makeDependencies({
      getEntitlementTier: () => {
        lookedUp = true;
        return Promise.resolve({ tier: "free" });
      },
      isBillingEnabled: () => false,
    })
  );

  await assert.doesNotReject(checkApiAllowance("user-1"));
  assert.equal(lookedUp, false);
});

test("admins bypass the pro gate", async () => {
  const checkApiAllowance = createApiAllowance(
    makeDependencies({
      isAdmin: (email) => email === "admin@example.com",
    })
  );

  await assert.doesNotReject(checkApiAllowance("user-1", "admin@example.com"));
});

test("tier lookup failures surface as UNKNOWN workflow errors", async () => {
  const checkApiAllowance = createApiAllowance(
    makeDependencies({
      getEntitlementTier: () => Promise.reject(new Error("db down")),
    })
  );

  await assert.rejects(checkApiAllowance("user-1"), { code: "UNKNOWN" });
});
