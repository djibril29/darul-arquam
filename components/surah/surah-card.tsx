import Link from "next/link";
import type { SurahSummary } from "@/lib/types/content";

export function SurahCard({ surah }: { surah: SurahSummary }) {
  // Total par défaut = sans bismillah (cohérent avec les versets affichés
  // dans la liste, qui ne comptent pas la bismillah virtuelle). Pour
  // Al-Fatiha, la bismillah est le verset 1 donc seul "avec" existe.
  const total = surah.totalValueWithoutBasmala ?? surah.totalValueWithBasmala;

  return (
    <Link
      href={`/surahs/${surah.number}`}
      className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3"
    >
      <div className="bg-secondary rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-primary font-body">{surah.number}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-headings font-semibold text-foreground">
          {surah.nameLatin}
        </p>
        <p className="text-xs text-muted-foreground font-body">
          {surah.versesCount} versets · {surah.revelationPlace}
        </p>
      </div>
      <div className="text-right">
        {total !== null ? (
          <span className="text-xs font-semibold bg-gold-soft text-gold-foreground rounded-full px-3 py-0.5 font-body">
            {total.toLocaleString("fr-FR")}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground font-body">À venir</span>
        )}
        <p
          className="text-xl text-foreground mt-1"
          style={{ fontFamily: "var(--font-arabic)", direction: "rtl" }}
        >
          {surah.nameArabic}
        </p>
      </div>
    </Link>
  );
}
