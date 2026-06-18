"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, NotebookPen, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/surahs", label: "Sourates", icon: BookOpen },
  { href: "/search", label: "Recherche", icon: Search },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/profile", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 bg-card border-t border-border flex items-stretch">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-2.5"
          >
            <Icon
              size={20}
              className={active ? "text-primary" : "text-muted-foreground"}
            />
            <span
              className={cn(
                "text-xs font-body",
                active ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                "w-1 h-1 rounded-full",
                active ? "bg-primary" : "bg-transparent"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
