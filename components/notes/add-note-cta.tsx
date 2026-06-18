import Link from "next/link";
import { NotebookPen, ChevronRight } from "lucide-react";

export function AddNoteCTA({ href, subtitle }: { href: string; subtitle: string }) {
  return (
    <Link
      href={href}
      className="bg-card border border-border rounded-xl px-4 py-4 flex items-center gap-3"
    >
      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <NotebookPen size={16} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground font-body">
          Ajouter une note
        </p>
        <p className="text-xs text-muted-foreground font-body">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </Link>
  );
}
