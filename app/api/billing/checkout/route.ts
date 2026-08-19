import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { getAppUrl } from "@/lib/app-url";
import { auth } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { parseCheckoutInterval } from "@/lib/billing/interval";
import { PRO_PLAN } from "@/lib/billing/pricing";
import { getCreem } from "@/lib/creem";
import { getRequiredEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  if (!isBillingEnabled()) {
    return NextResponse.json(
      { error: "Billing is not enabled on this deployment." },
      { status: 404 }
    );
  }

  // getCurrentUser redirects unauthenticated callers, which would break a fetch
  // from the client; return JSON instead.
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const interval = parseCheckoutInterval(await request.text());

  if (!interval) {
    return NextResponse.json(
      { error: "Unknown billing interval." },
      { status: 400 }
    );
  }

  try {
    const checkout = await getCreem().checkouts.create({
      customer: { email: session.user.email },
      // referenceId is the only link back to a better-auth user when the
      // webhook arrives, so it must always be set.
      metadata: {
        interval,
        plan: PRO_PLAN.id,
        referenceId: session.user.id,
        source: "youtubetoblog",
        userId: session.user.id,
      },
      productId: getRequiredEnv(PRO_PLAN.intervals[interval].productEnvKey),
      requestId: crypto.randomUUID(),
      successUrl: new URL(
        "/account/billing?checkout=success",
        getAppUrl()
      ).toString(),
    });

    if (!checkout.checkoutUrl) {
      return NextResponse.json(
        { error: "Checkout could not be started. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: checkout.checkoutUrl });
  } catch (error) {
    console.error("Creem checkout failed", error);

    return NextResponse.json(
      { error: "Checkout could not be started. Please try again." },
      { status: 502 }
    );
  }
}
