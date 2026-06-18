import { notFound } from "next/navigation";
import { BackHeader } from "@/components/layout/back-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AddNoteCTA } from "@/components/notes/add-note-cta";
import { VerseDetailClient } from "@/components/verse/verse-detail-client";
import { getVerseByKey, getSurahNameByNumber } from "@/lib/supabase/queries";
import { getOverridesForSurah } from "@/lib/supabase/overrides";
import { computeVersePersonalValue } from "@/lib/overrides/cascade";

export default async function VerseDetailPage({
  params,
}: {
  params: Promise<{ verseKey: string }>;
}) {
  const { verseKey } = await params;
  const verse = await getVerseByKey(decodeURIComponent(verseKey));

  if (!verse) notFound();

  const surahName = await getSurahNameByNumber(verse.surahNumber);
  const overrides = await getOverridesForSurah(verse.surahNumber);
  const versePersonalValue = computeVersePersonalValue(verse, overrides);

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <BackHeader
        href={`/surahs/${verse.surahNumber}`}
        eyebrow={`${surahName} · ${verse.verseKey}`}
        title="Détail du calcul"
      />

      <div className="flex-1 px-4 pt-5 pb-4 flex flex-col gap-4">
        <VerseDetailClient verse={verse} versePersonalValue={versePersonalValue} />
        <AddNoteCTA
          href={`/notes/new?verse=${verse.verseKey}`}
          subtitle="Vos réflexions et observations"
        />
      </div>

      <BottomNav />
    </div>
  );
}
