import { Creem, ServerProd, ServerTest } from "creem";

import { getRequiredEnv } from "@/lib/env";

let creem: Creem | null = null;

export function getCreem(): Creem {
  if (!creem) {
    creem = new Creem({
      apiKey: getRequiredEnv("CREEM_API_KEY"),
      server: process.env.CREEM_TEST_MODE === "true" ? ServerTest : ServerProd,
    });
  }

  return creem;
}
