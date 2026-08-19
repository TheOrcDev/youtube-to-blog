import Link from "next/link";
import { redirect } from "next/navigation";

import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUsageSummary } from "@/server/usage";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function BillingSummary({
  checkout,
}: {
  checkout: string | undefined;
}) {
  const summary = await getUsageSummary();

  // Null means billing is on but nobody is signed in.
  if (summary === null) {
    redirect("/login");
  }

  if (!summary.billingEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing is not configured</CardTitle>
          <CardDescription>
            This deployment runs without payment credentials, so blog generation
            is unlimited.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isPro = summary.tier === "pro";

  return (
    <>
      {checkout === "success" && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle>Thanks for subscribing</CardTitle>
            <CardDescription>
              {isPro
                ? "Your Pro plan is active."
                : "We are confirming your payment. This page will show Pro once it lands — refresh in a moment."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Current plan</CardTitle>
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
          <CardDescription>
            {summary.used} of {summary.limit} generations used this month
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 text-muted-foreground text-sm">
          <p>Your monthly allowance resets on the first day of next month.</p>
          {summary.currentPeriodEnd ? (
            <p>
              {summary.cancelAtPeriodEnd
                ? `Your subscription ends on ${formatDate(summary.currentPeriodEnd)}.`
                : `Your subscription renews on ${formatDate(summary.currentPeriodEnd)}.`}
            </p>
          ) : null}
          {summary.subscriptionStatus === "past_due" ? (
            <p className="text-destructive">
              Your last payment failed. Update your payment method to keep Pro.
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-2">
          {summary.hasCreemCustomer ? <BillingPortalButton /> : null}
          {isPro ? null : (
            <>
              <CheckoutButton interval="year">Upgrade to Pro</CheckoutButton>
              <Button asChild variant="ghost">
                <Link href="/pricing">Compare plans</Link>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
