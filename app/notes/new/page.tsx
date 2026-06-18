import { BackHeader } from "@/components/layout/back-header";
import { getSurahNameByNumber } from "@/lib/supabase/queries";
import { createNoteAction } from "@/app/notes/actions";
import type { NoteType } from "@/lib/types/notes";

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<{ verse?: string; surah?: string; error?: string }>;
}) {
  const { verse, surah, error } = await searchParams;
  const surahNumber = surah ? Number(surah) : null;

  let noteType: NoteType = "general";
  let contextLabel = "Note générale";

  if (verse) {
    noteType = "verse";
    const surahNum = Number(verse.split(":")[0]);
    const surahName = await getSurahNameByNumber(surahNum);
    contextLabel = `Verset ${verse} · ${surahName}`;
  } else if (surahNumber) {
    noteType = "surah";
    const surahName = await getSurahNameByNumber(surahNumber);
    contextLabel = `Sourate · ${surahName}`;
  }

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <BackHeader href="/notes" title="Nouvelle note" />

      <form action={createNoteAction} className="flex-1 px-4 pt-5 pb-4 flex flex-col gap-4">
        <input type="hidden" name="noteType" value={noteType} />
        {verse ? <input type="hidden" name="verseKey" value={verse} /> : null}
        {surahNumber ? <input type="hidden" name="surahNumber" value={surahNumber} /> : null}

        <span className="self-start bg-secondary text-secondary-foreground rounded-full px-3 py-1.5 text-xs font-semibold font-body">
          {contextLabel}
        </span>

        {error ? (
          <p className="bg-destructive/10 text-destructive text-xs font-body rounded-xl px-4 py-3">
            {error}
          </p>
        ) : null}

        <textarea
          name="content"
          rows={8}
          required
          placeholder="Écris ton observation, ton analyse ou ta question..."
          className="bg-card border border-border rounded-xl px-4 py-3 text-sm font-body outline-none placeholder:text-muted-foreground resize-none"
        />

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold font-body"
        >
          Enregistrer la note
        </button>
      </form>
    </div>
  );
}
