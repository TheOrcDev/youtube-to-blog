import assert from "node:assert/strict";
import test from "node:test";

import { createUploadAllowance } from "../server/upload-allowance.ts";

function makeDependencies(overrides = {}) {
  return {
    getEntitlementTier: () => Promise.resolve({ tier: "free" }),
    isAdmin: () => false,
    isBillingEnabled: () => true,
    ...overrides,
  };
}

test("pro users may upload videos", async () => {
  const checkUploadAllowance = createUploadAllowance(
    makeDependencies({
      getEntitlementTier: () => Promise.resolve({ tier: "pro" }),
    })
  );

  await assert.doesNotReject(checkUploadAllowance("user-1"));
});

test("free users are rejected with UPLOAD_REQUIRES_PRO", async () => {
  const checkUploadAllowance = createUploadAllowance(makeDependencies());

  await assert.rejects(checkUploadAllowance("user-1"), {
    code: "UPLOAD_REQUIRES_PRO",
  });
});

test("unknown tiers are treated as free", async () => {
  const checkUploadAllowance = createUploadAllowance(
    makeDependencies({
      getEntitlementTier: () => Promise.resolve({ tier: "banana" }),
    })
  );

  await assert.rejects(checkUploadAllowance("user-1"), {
    code: "UPLOAD_REQUIRES_PRO",
  });
});

test("self-hosted deployments skip the gate entirely", async () => {
  let lookedUp = false;

  const checkUploadAllowance = createUploadAllowance(
    makeDependencies({
      getEntitlementTier: () => {
        lookedUp = true;
        return Promise.resolve({ tier: "free" });
      },
      isBillingEnabled: () => false,
    })
  );

  await assert.doesNotReject(checkUploadAllowance("user-1"));
  assert.equal(lookedUp, false);
});

test("admins bypass the pro gate", async () => {
  const checkUploadAllowance = createUploadAllowance(
    makeDependencies({
      isAdmin: (email) => email === "admin@example.com",
    })
  );

  await assert.doesNotReject(
    checkUploadAllowance("user-1", "admin@example.com")
  );
});
