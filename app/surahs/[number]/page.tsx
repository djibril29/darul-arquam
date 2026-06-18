import { notFound } from "next/navigation";
import { BackHeader } from "@/components/layout/back-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SurahInfoCard } from "@/components/surah/surah-info-card";
import { VerseCard } from "@/components/verse/verse-card";
import { AddNoteCTA } from "@/components/notes/add-note-cta";
import { getSurahByNumber, getVersesBySurah } from "@/lib/supabase/queries";
import { needsVirtualBasmala, BASMALA_TEXT_UTHMANI, calculateBasmalaValue } from "@/lib/gematria/basmala";
import { ValuePill } from "@/components/shared/pills";
import { getOverridesForSurah } from "@/lib/supabase/overrides";
import { computeSurahPersonalValue, computeVersePersonalValue } from "@/lib/overrides/cascade";

export default async function SurahDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const surahNumber = Number(number);
  const surah = await getSurahByNumber(surahNumber);

  if (!surah) notFound();

  const verses = await getVersesBySurah(surahNumber);
  const showVirtualBasmala = surah.hasContent && needsVirtualBasmala(surahNumber);

  const overrides = await getOverridesForSurah(surahNumber);
  const surahPersonalValue = computeSurahPersonalValue(verses, overrides);

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <BackHeader
        href="/surahs"
        eyebrow={`Sourate ${surah.number}`}
        title={surah.nameLatin}
        right={
          <div
            className="text-2xl text-foreground"
            style={{ fontFamily: "var(--font-arabic)", direction: "rtl", lineHeight: 1.6 }}
          >
            {surah.nameArabic}
          </div>
        }
      />

      <div className="flex-1 px-4 pt-5 pb-4 flex flex-col gap-4">
        <SurahInfoCard surah={surah} personalValue={surahPersonalValue} />

        {showVirtualBasmala ? (
          <div className="bg-gold-soft rounded-xl border border-gold/30 px-4 py-4 text-center">
            <div className="flex justify-center mb-1">
              <ValuePill>{calculateBasmalaValue().total.toLocaleString("fr-FR")}</ValuePill>
            </div>
            <p
              className="text-2xl text-foreground"
              style={{ fontFamily: "var(--font-arabic)", direction: "rtl", lineHeight: 2 }}
            >
              {BASMALA_TEXT_UTHMANI}
            </p>
            <p className="text-xs text-muted-foreground font-body italic mt-2">
              Au nom d&apos;Allah, le Tout Miséricordieux, le Très Miséricordieux.
            </p>
            <p className="text-[11px] text-muted-foreground font-body mt-1">
              Récitée au début de la sourate, non numérotée comme verset.
            </p>
          </div>
        ) : null}

        {surah.hasContent ? (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
              Versets
            </h3>
            {verses.map((verse) => (
              <VerseCard
                key={verse.verseKey}
                verse={verse}
                personalValue={computeVersePersonalValue(verse, overrides)}
              />
            ))}
            <AddNoteCTA
              href={`/notes/new?surah=${surah.number}`}
              subtitle="Vos réflexions et observations"
            />
          </>
        ) : (
          <div className="bg-card border border-border rounded-xl px-4 py-6 text-center">
            <p className="text-sm font-semibold text-foreground font-body">
              Pas encore importée
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Le contenu verset par verset de cette sourate sera disponible après l&apos;import
              depuis l&apos;API Quran Foundation (Phase 5).
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
