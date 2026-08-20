import { headers } from "next/headers";
import Link from "next/link";

import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getUserEntitlementSnapshot } from "@/lib/entitlements/snapshot";

export async function UserButton({
  billingEnabled,
}: {
  billingEnabled: boolean;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <Button asChild size="sm" variant="ghost">
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  const isPro =
    billingEnabled &&
    (await getUserEntitlementSnapshot(session.user.id)).tier === "pro";

  return (
    <DashboardUserMenu
      billingEnabled={billingEnabled}
      email={session.user.email}
      image={session.user.image ?? null}
      isPro={isPro}
      name={session.user.name}
    />
  );
}
