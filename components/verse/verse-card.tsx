import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { VerseContent } from "@/lib/types/content";
import type { VersePersonalValue } from "@/lib/overrides/cascade";
import { VerseKeyPill, ValuePill } from "@/components/shared/pills";

export function VerseCard({
  verse,
  personalValue,
}: {
  verse: VerseContent;
  personalValue?: VersePersonalValue;
}) {
  return (
    <div className="bg-card rounded-xl border border-border px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <VerseKeyPill>{verse.verseKey}</VerseKeyPill>
        <div className="flex items-center gap-1.5">
          {personalValue?.hasOverride ? (
            <span className="text-xs text-muted-foreground font-body line-through">
              {verse.totalValue.toLocaleString("fr-FR")}
            </span>
          ) : null}
          <ValuePill>
            {(personalValue?.total ?? verse.totalValue).toLocaleString("fr-FR")}
          </ValuePill>
        </div>
      </div>
      <p
        className="text-2xl text-foreground mb-2"
        style={{ fontFamily: "var(--font-arabic)", direction: "rtl", textAlign: "right", lineHeight: 2 }}
      >
        {verse.textUthmani}
      </p>
      {verse.frenchTranslation ? (
        <p className="text-xs text-muted-foreground font-body leading-relaxed mb-3 italic">
          {verse.frenchTranslation}
        </p>
      ) : null}
      <div className="border-t border-border pt-3 flex flex-col gap-1.5">
        {verse.words.map((w, i) => {
          const wordPersonal = personalValue?.words[i];
          return (
            <div key={i} className="flex items-center justify-between">
              <span
                className="text-base text-foreground"
                style={{ fontFamily: "var(--font-arabic)", direction: "rtl" }}
              >
                {w.word}
              </span>
              <div className="flex items-center gap-1.5">
                {wordPersonal?.hasOverride ? (
                  <span className="text-xs text-muted-foreground font-body line-through">
                    {w.value}
                  </span>
                ) : null}
                <span className="text-sm font-semibold text-primary font-body">
                  {wordPersonal?.value ?? w.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <Link
        href={`/verses/${verse.verseKey}`}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-primary font-body"
      >
        Voir le calcul détaillé <ArrowRight size={12} />
      </Link>
    </div>
  );
}
