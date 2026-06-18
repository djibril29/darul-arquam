"use client";

import { useMemo, useState } from "react";
import { Info, X } from "lucide-react";
import { NoteCard } from "@/components/notes/note-card";
import type { NoteSummary, NoteType } from "@/lib/types/notes";
import type { SurahSummary } from "@/lib/types/content";

const TYPE_FILTERS: { label: string; value: NoteType | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "Verset", value: "verse" },
  { label: "Sourate", value: "surah" },
  { label: "Général", value: "general" },
];

export function NotesClient({
  initialSurahNumber,
  surahs,
  notes: allNotes,
}: {
  initialSurahNumber: number | null;
  surahs: SurahSummary[];
  notes: NoteSummary[];
}) {
  const [typeFilter, setTypeFilter] = useState<NoteType | "all">("all");
  const [surahFilter, setSurahFilter] = useState<number | null>(initialSurahNumber);

  const notes = useMemo(() => {
    return allNotes.filter((n) => {
      if (typeFilter !== "all" && n.noteType !== typeFilter) return false;
      if (surahFilter !== null && n.surahNumber !== surahFilter) return false;
      return true;
    });
  }, [allNotes, typeFilter, surahFilter]);

  const versesCount = new Set(allNotes.map((n) => n.verseKey).filter(Boolean)).size;
  const surahsCount = new Set(allNotes.map((n) => n.surahNumber).filter(Boolean)).size;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <StatCard value={allNotes.length} label="notes" />
        <StatCard value={versesCount} label="versets" />
        <StatCard value={surahsCount} label="sourates" />
      </div>

      {surahFilter !== null ? (
        <button
          type="button"
          onClick={() => setSurahFilter(null)}
          className="self-start flex items-center gap-1.5 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold font-body"
        >
          {surahs.find((s) => s.number === surahFilter)?.nameLatin ?? `Sourate ${surahFilter}`}{" "}
          <X size={12} />
        </button>
      ) : null}

      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => {
          const active = f.value === typeFilter;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setTypeFilter(f.value)}
              className={
                active
                  ? "bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-semibold font-body"
                  : "bg-card border border-border rounded-full px-3 py-1.5 text-xs font-medium font-body"
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            surahName={surahs.find((s) => s.number === note.surahNumber)?.nameLatin}
          />
        ))}
        {notes.length === 0 ? (
          <div className="bg-card border border-border rounded-xl px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground font-body">
              Aucune note pour ce filtre.
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-start gap-2 px-1">
        <Info size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          Chaque note reste reliée à son verset ou sa sourate — ouvre-la pour retrouver le calcul
          complet.
        </p>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 bg-card rounded-xl border border-border px-4 py-3 flex flex-col items-center">
      <span className="text-xl font-headings font-bold text-primary">{value}</span>
      <span className="text-xs text-muted-foreground font-body">{label}</span>
    </div>
  );
}
