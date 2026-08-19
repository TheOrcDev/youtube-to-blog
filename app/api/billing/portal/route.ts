import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db/drizzle";
import { userEntitlements } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { getCreem } from "@/lib/creem";

export async function POST() {
  if (!isBillingEnabled()) {
    return NextResponse.json(
      { error: "Billing is not enabled on this deployment." },
      { status: 404 }
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const [entitlement] = await db
    .select({ creemCustomerId: userEntitlements.creemCustomerId })
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, session.user.id))
    .limit(1);

  if (!entitlement?.creemCustomerId) {
    return NextResponse.json(
      { error: "No billing account found for this user yet." },
      { status: 409 }
    );
  }

  try {
    const portal = await getCreem().customers.generateBillingLinks({
      customerId: entitlement.creemCustomerId,
    });

    if (!portal.customerPortalLink) {
      return NextResponse.json(
        { error: "The billing portal is unavailable. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: portal.customerPortalLink });
  } catch (error) {
    console.error("Creem billing portal failed", error);

    return NextResponse.json(
      { error: "The billing portal is unavailable. Please try again." },
      { status: 502 }
    );
  }
}
