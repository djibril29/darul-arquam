import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type BackHeaderProps = {
  href: string;
  eyebrow?: string;
  title: string;
  right?: ReactNode;
};

export function BackHeader({ href, eyebrow, title, right }: BackHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-5 pt-10 pb-4 flex items-center gap-3">
      <Link
        href={href}
        className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
      >
        <ArrowLeft size={18} />
      </Link>
      <div className="flex-1">
        {eyebrow ? (
          <p className="text-xs text-muted-foreground font-body">{eyebrow}</p>
        ) : null}
        <h1 className="text-base font-headings font-semibold text-foreground">
          {title}
        </h1>
      </div>
      {right}
    </div>
  );
}
