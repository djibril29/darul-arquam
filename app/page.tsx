import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { WelcomeCard } from "@/components/shared/welcome-card";
import { SearchBar } from "@/components/search/search-bar";
import { SurahCard } from "@/components/surah/surah-card";
import { NoteCard } from "@/components/notes/note-card";
import { getSurahs } from "@/lib/supabase/queries";
import { getUserNotes } from "@/lib/supabase/notes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: { user } }, surahs, notes] = await Promise.all([
    supabase.auth.getUser(),
    getSurahs(),
    getUserNotes(),
  ]);
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? "Utilisateur";
  const recentNotes = notes.slice(0, 2);
  const versesCount = surahs.reduce((sum, s) => sum + s.versesCount, 0);

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <AppHeader title="Darul Arqam" subtitle="Lecture & analyse numérique" />

      <div className="flex-1 px-4 pt-5 pb-4 flex flex-col gap-5">
        <WelcomeCard
          name={fullName}
          surahsCount={surahs.length}
          versesCount={versesCount}
          notesCount={notes.length}
        />

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
            Analyse numérique
          </h3>
          <SearchBar />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
              Sourates du MVP
            </h3>
            <Link href="/surahs" className="flex items-center gap-0.5 text-xs text-primary font-body">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {surahs.slice(0, 4).map((surah) => (
              <SurahCard key={surah.number} surah={surah} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">
              Dernières notes
            </h3>
            <Link href="/notes" className="flex items-center gap-0.5 text-xs text-primary font-body">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                surahName={surahs.find((s) => s.number === note.surahNumber)?.nameLatin}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
