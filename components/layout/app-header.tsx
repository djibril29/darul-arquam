import Link from "next/link";
import { MoonStar, Settings } from "lucide-react";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-5 pt-10 pb-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
        <MoonStar size={18} className="text-primary-foreground" />
      </div>
      <div className="flex-1">
        <h1 className="text-base font-headings font-semibold text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-xs text-muted-foreground font-body">{subtitle}</p>
        ) : null}
      </div>
      <Link
        href="/settings"
        className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
      >
        <Settings size={18} />
      </Link>
    </div>
  );
}
