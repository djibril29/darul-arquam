import { cn } from "@/lib/utils";

export function VerseKeyPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-xs font-semibold bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 font-body",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ValuePill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-xs font-semibold bg-gold-soft text-gold-foreground rounded-full px-3 py-0.5 font-body",
        className
      )}
    >
      {children}
    </span>
  );
}
