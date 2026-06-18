import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GradientPanelProps = {
  variant?: "banner" | "card";
  className?: string;
  children: ReactNode;
};

/** Bloc gradient vert décoratif (bandeau plein écran ou carte arrondie) avec overlay de points. */
export function GradientPanel({
  variant = "card",
  className,
  children,
}: GradientPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        variant === "card" ? "rounded-xl bg-gradient-primary" : "bg-gradient-primary-banner",
        className
      )}
    >
      <div className="absolute inset-0 opacity-10 bg-dot-pattern-light" />
      {children}
    </div>
  );
}

type DecorativeCircleProps = {
  size: number;
  className?: string;
};

export function DecorativeCircle({ size, className }: DecorativeCircleProps) {
  return (
    <div
      className={cn("absolute rounded-full opacity-10 border-2 border-gold", className)}
      style={{ width: size, height: size }}
    />
  );
}
