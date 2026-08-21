import assert from "node:assert/strict";
import test from "node:test";

import {
  isAdminEmail,
  parseAdminEmails,
  shouldShowProBadge,
} from "../lib/entitlements/admin.ts";
import { createGenerationAllowance } from "../server/generation-allowance.ts";

test("admin emails are parsed from a comma separated list", () => {
  assert.deepEqual(parseAdminEmails("a@b.com, C@D.com"), [
    "a@b.com",
    "c@d.com",
  ]);
  assert.deepEqual(parseAdminEmails(""), []);
  assert.deepEqual(parseAdminEmails(undefined), []);
  assert.deepEqual(parseAdminEmails(" , ,"), []);
});

test("admin matching ignores case and surrounding whitespace", () => {
  const raw = "orc@orcdev.com";
  assert.equal(isAdminEmail("orc@orcdev.com", raw), true);
  assert.equal(isAdminEmail("  ORC@OrcDev.com  ", raw), true);
  assert.equal(isAdminEmail("someone@else.com", raw), false);
  assert.equal(isAdminEmail(null, raw), false);
  assert.equal(isAdminEmail(undefined, raw), false);
  assert.equal(isAdminEmail("", raw), false);
});

test("a missing or empty admin list grants nobody admin", () => {
  assert.equal(isAdminEmail("orc@orcdev.com", undefined), false);
  assert.equal(isAdminEmail("orc@orcdev.com", ""), false);
});

test("the account Pro badge shows for admins and billed Pro users", () => {
  const adminEmails = "orc@orcdev.com";

  assert.equal(
    shouldShowProBadge({
      adminEmails,
      billingEnabled: true,
      email: "orc@orcdev.com",
      tier: "free",
    }),
    true
  );
  assert.equal(
    shouldShowProBadge({
      adminEmails,
      billingEnabled: false,
      email: "orc@orcdev.com",
      tier: "free",
    }),
    true
  );
  assert.equal(
    shouldShowProBadge({
      adminEmails,
      billingEnabled: true,
      email: "someone@else.com",
      tier: "pro",
    }),
    true
  );
  assert.equal(
    shouldShowProBadge({
      adminEmails,
      billingEnabled: true,
      email: "someone@else.com",
      tier: "free",
    }),
    false
  );
  assert.equal(
    shouldShowProBadge({
      adminEmails,
      billingEnabled: false,
      email: "someone@else.com",
      tier: "pro",
    }),
    false
  );
});

test("an admin generates without limits and never hits the database", async () => {
  const check = createGenerationAllowance({
    countBlogsCreatedSince: () => {
      throw new Error("must not count usage for an admin");
    },
    getEntitlementTier: () => {
      throw new Error("must not read entitlements for an admin");
    },
    isAdmin: (email) => email === "orc@orcdev.com",
    isBillingEnabled: () => true,
  });

  const allowance = await check("user-123", "orc@orcdev.com");

  assert.equal(allowance.remaining, null);
  assert.equal(allowance.model, "anthropic/claude-sonnet-4-5");
});

test("a non-admin on the free tier is still metered", async () => {
  const check = createGenerationAllowance({
    countBlogsCreatedSince: () => Promise.resolve(5),
    getEntitlementTier: () => Promise.resolve({ tier: "free" }),
    isAdmin: (email) => email === "orc@orcdev.com",
    isBillingEnabled: () => true,
  });

  await assert.rejects(
    () => check("user-123", "someone@else.com"),
    (error) => error.code === "QUOTA_EXCEEDED"
  );
});

test("an admin stays unlimited even with no entitlement row", async () => {
  const check = createGenerationAllowance({
    countBlogsCreatedSince: () => Promise.reject(new Error("no row")),
    getEntitlementTier: () => Promise.reject(new Error("no row")),
    isAdmin: () => true,
    isBillingEnabled: () => true,
  });

  const allowance = await check("user-123", "orc@orcdev.com");
  assert.equal(allowance.remaining, null);
});
