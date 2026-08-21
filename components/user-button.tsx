import { headers } from "next/headers";
import Link from "next/link";

import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { shouldShowProBadge } from "@/lib/entitlements/admin";
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

  const isPro = shouldShowProBadge({
    adminEmails: process.env.ADMIN_EMAILS,
    billingEnabled,
    email: session.user.email,
    tier: (await getUserEntitlementSnapshot(session.user.id)).tier,
  });

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
