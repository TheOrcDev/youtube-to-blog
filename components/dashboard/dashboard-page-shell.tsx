import type { ReactNode } from "react";

export function DashboardPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 sm:p-6">
      {children}
    </div>
  );
}
