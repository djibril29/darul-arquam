import type { ReactNode } from "react";

export function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
      {children}
    </div>
  );
}
