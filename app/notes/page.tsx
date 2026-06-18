import Link from "next/link";
import { Plus } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotesClient } from "@/components/notes/notes-client";
import { getSurahs } from "@/lib/supabase/queries";
import { getUserNotes } from "@/lib/supabase/notes";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ surah?: string }>;
}) {
  const { surah } = await searchParams;
  const surahNumber = surah ? Number(surah) : null;
  const [surahs, notes] = await Promise.all([getSurahs(), getUserNotes()]);

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <div className="px-5 pt-10 pb-4 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-headings font-semibold text-foreground">Notes</h1>
        </div>
        <Link
          href={surahNumber ? `/notes/new?surah=${surahNumber}` : "/notes/new"}
          className="bg-primary text-primary-foreground rounded-lg px-3 py-2 flex items-center gap-1.5 text-xs font-semibold font-body"
        >
          <Plus size={13} /> Nouvelle note
        </Link>
      </div>

      <div className="flex-1 px-4 pb-4">
        <NotesClient initialSurahNumber={surahNumber} surahs={surahs} notes={notes} />
      </div>

      <BottomNav />
    </div>
  );
}
