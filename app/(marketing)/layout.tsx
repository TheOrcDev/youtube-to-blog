import type { ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { isBillingEnabled } from "@/lib/billing/enabled";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar billingEnabled={isBillingEnabled()} />
      <div className="pt-16 pb-20">{children}</div>
      <Footer />
    </>
  );
}
