import assert from "node:assert/strict";
import test from "node:test";

import {
  isProProductId,
  parseCheckoutInterval,
  resolveBillingIntervalForProduct,
} from "../lib/billing/interval.ts";

const MONTHLY_PRODUCT = "prod_monthly_123";
const YEARLY_PRODUCT = "prod_yearly_456";

function withProductEnv(env, run) {
  const previous = {
    month: process.env.CREEM_PRO_PRODUCT_ID,
    year: process.env.CREEM_PRO_YEARLY_PRODUCT_ID,
  };

  process.env.CREEM_PRO_PRODUCT_ID = env.month;

  if (env.year === undefined) {
    process.env.CREEM_PRO_YEARLY_PRODUCT_ID = undefined;
    process.env.CREEM_PRO_YEARLY_PRODUCT_ID = "";
  } else {
    process.env.CREEM_PRO_YEARLY_PRODUCT_ID = env.year;
  }

  try {
    run();
  } finally {
    process.env.CREEM_PRO_PRODUCT_ID = previous.month ?? "";
    process.env.CREEM_PRO_YEARLY_PRODUCT_ID = previous.year ?? "";
  }
}

test("an upgrade link without a body checks out monthly", () => {
  assert.equal(parseCheckoutInterval(""), "month");
  assert.equal(parseCheckoutInterval("   "), "month");
  assert.equal(parseCheckoutInterval(JSON.stringify({})), "month");
});

test("an explicit yearly interval is honored", () => {
  assert.equal(
    parseCheckoutInterval(JSON.stringify({ interval: "year" })),
    "year"
  );
  assert.equal(
    parseCheckoutInterval(JSON.stringify({ interval: "month" })),
    "month"
  );
});

test("an unsupported or malformed interval is rejected", () => {
  assert.equal(
    parseCheckoutInterval(JSON.stringify({ interval: "weekly" })),
    null
  );
  assert.equal(parseCheckoutInterval("{not json"), null);
  assert.equal(parseCheckoutInterval(JSON.stringify({ interval: 12 })), null);
});

test("only configured Pro products are recognized", () => {
  withProductEnv({ month: MONTHLY_PRODUCT, year: YEARLY_PRODUCT }, () => {
    assert.equal(isProProductId(MONTHLY_PRODUCT), true);
    assert.equal(isProProductId(YEARLY_PRODUCT), true);
    assert.equal(isProProductId("prod_unrelated"), false);
    assert.equal(isProProductId(null), false);
  });
});

test("a product id resolves back to its billing interval", () => {
  withProductEnv({ month: MONTHLY_PRODUCT, year: YEARLY_PRODUCT }, () => {
    assert.equal(resolveBillingIntervalForProduct(YEARLY_PRODUCT), "year");
    assert.equal(resolveBillingIntervalForProduct(MONTHLY_PRODUCT), "month");
    assert.equal(resolveBillingIntervalForProduct(null), "month");
  });
});

test("an unprovisioned yearly product leaves monthly checkout working", () => {
  withProductEnv({ month: MONTHLY_PRODUCT, year: undefined }, () => {
    assert.equal(isProProductId(MONTHLY_PRODUCT), true);
    assert.equal(isProProductId(YEARLY_PRODUCT), false);
    assert.equal(resolveBillingIntervalForProduct(MONTHLY_PRODUCT), "month");
  });
});
