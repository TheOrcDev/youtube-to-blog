import type { Metadata } from "next";
import Link from "next/link";

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
import { isBillingEnabled } from "@/lib/billing/enabled";
import { FREE_PLAN, PRO_PLAN } from "@/lib/billing/pricing";

export const metadata: Metadata = {
  description:
    "Turn YouTube videos into blog posts for free, or upgrade to Pro for a higher monthly limit and a premium AI model.",
  title: "Pricing",
};

const GITHUB_URL = "https://github.com/TheOrcDev/youtube-to-blog";

function PlanFeatures({ features }: { features: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
      {features.map((feature) => (
        <li className="flex items-start gap-2" key={feature}>
          <span aria-hidden="true">•</span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  const billingEnabled = isBillingEnabled();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <Button
        asChild
        className="absolute top-4 left-1/2 mx-auto -translate-x-1/2"
        variant="outline"
      >
        <Link href="/">Back</Link>
      </Button>

      <div className="mb-10 text-center">
        <h1 className="font-bold text-4xl">Pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Turn any YouTube video into a blog post. Start free, upgrade when you
          need more.
        </p>
      </div>

      {billingEnabled ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{FREE_PLAN.name}</CardTitle>
              <CardDescription>
                <span className="font-bold text-3xl text-foreground">$0</span>
                <span className="ml-1">forever</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanFeatures features={FREE_PLAN.features} />
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/">Start generating</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{PRO_PLAN.name}</CardTitle>
                <Badge>{PRO_PLAN.intervals.year.badge}</Badge>
              </div>
              <CardDescription>
                <span className="font-bold text-3xl text-foreground">
                  ${PRO_PLAN.intervals.month.priceUsd}
                </span>
                <span className="ml-1">/ month</span>
                <span className="mt-1 block">
                  or ${PRO_PLAN.intervals.year.priceUsd}/year (~$
                  {PRO_PLAN.intervals.year.perMonthUsd}/mo)
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanFeatures features={PRO_PLAN.features} />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2">
              <CheckoutButton className="w-full" interval="year">
                Get Pro yearly
              </CheckoutButton>
              <CheckoutButton
                className="w-full"
                interval="month"
                variant="outline"
              >
                Get Pro monthly
              </CheckoutButton>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Billing is disabled on this deployment</CardTitle>
            <CardDescription>
              Blog generation is unlimited here — no plans, no limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <p>
              YouTube to Blog is open source. When it runs without payment
              credentials configured, every feature is available without a
              subscription.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href={GITHUB_URL} rel="noopener noreferrer" target="_blank">
                Self-host it yourself
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <p className="mt-10 text-center text-muted-foreground text-sm">
        YouTube to Blog is fully open source. Prefer to run it yourself?{" "}
        <Link
          className="underline underline-offset-4"
          href={GITHUB_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Grab the source
        </Link>{" "}
        and bring your own API keys — no limits, no subscription.
      </p>
    </main>
  );
}
