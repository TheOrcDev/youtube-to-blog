import assert from "node:assert/strict";
import test from "node:test";

import { assertAiGatewayConfiguration } from "../server/ai-gateway.ts";

test("an invalid AI Gateway API key is rejected before generation", () => {
  assert.throws(
    () =>
      assertAiGatewayConfiguration({
        apiKey: "legacy-or-wrong-key",
        oidcToken: undefined,
      }),
    (error) => error.code === "AI_NOT_CONFIGURED"
  );
});

test("a Vercel AI Gateway key is accepted", () => {
  assert.doesNotThrow(() =>
    assertAiGatewayConfiguration({
      apiKey: "vck_replacement-key",
      oidcToken: undefined,
    })
  );
});

test("a Vercel OIDC token can authenticate generation without an API key", () => {
  assert.doesNotThrow(() =>
    assertAiGatewayConfiguration({
      apiKey: undefined,
      oidcToken: "header.payload.signature",
    })
  );
});
