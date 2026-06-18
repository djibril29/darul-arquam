import { BackHeader } from "@/components/layout/back-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SurahCard } from "@/components/surah/surah-card";
import { getSurahs } from "@/lib/supabase/queries";

export default async function SurahsPage() {
  const surahs = await getSurahs();

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <BackHeader href="/" title="Sourates" eyebrow={`${surahs.length} sourates du MVP`} />

      <div className="flex-1 px-4 pt-5 pb-4 flex flex-col gap-2">
        {surahs.map((surah) => (
          <SurahCard key={surah.number} surah={surah} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
