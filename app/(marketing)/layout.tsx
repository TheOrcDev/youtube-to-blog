import type { ReactNode } from "react";
import { Suspense } from "react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@/components/user-button";
import { isBillingEnabled } from "@/lib/billing/enabled";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const billingEnabled = isBillingEnabled();

  return (
    <>
      <Navbar
        account={
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <UserButton billingEnabled={billingEnabled} />
          </Suspense>
        }
        billingEnabled={billingEnabled}
      />
      <div className="pt-16 pb-20">{children}</div>
      <Footer />
    </>
  );
}
