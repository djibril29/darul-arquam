"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { NoteSummary } from "@/lib/types/notes";
import { VerseKeyPill } from "@/components/shared/pills";
import { formatRelativeDate } from "@/lib/format-date";
import { updateNoteAction, deleteNoteAction } from "@/app/notes/actions";

const TYPE_LABELS: Record<NoteSummary["noteType"], string> = {
  verse: "Verset",
  surah: "Sourate",
  general: "Général",
};

export function NoteCard({ note, surahName }: { note: NoteSummary; surahName?: string }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [isPending, startTransition] = useTransition();

  const href =
    note.verseKey ? `/verses/${note.verseKey}` : note.surahNumber ? `/surahs/${note.surahNumber}` : null;

  function saveEdit() {
    const content = draft.trim();
    if (!content) return;
    startTransition(async () => {
      await updateNoteAction(note.id, content);
      setIsEditing(false);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!window.confirm("Supprimer cette note ?")) return;
    startTransition(async () => {
      await deleteNoteAction(note.id);
      router.refresh();
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {note.verseKey ? <VerseKeyPill>{note.verseKey}</VerseKeyPill> : null}
          <span className="text-xs font-semibold rounded-full px-2 py-0.5 font-body bg-secondary text-secondary-foreground">
            {TYPE_LABELS[note.noteType]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-body">
          {formatRelativeDate(note.createdAt)}
        </span>
      </div>

      {note.surahNumber && !note.verseKey ? (
        <p className="text-xs text-muted-foreground font-body">{surahName}</p>
      ) : null}

      {isEditing ? (
        <textarea
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm font-body outline-none resize-none"
        />
      ) : (
        <p className="text-sm text-foreground font-body leading-relaxed">{note.content}</p>
      )}

      <div className="border-t border-border pt-3 flex items-center gap-4">
        {isEditing ? (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={saveEdit}
              className="flex items-center gap-1 text-xs font-medium text-primary font-body disabled:opacity-50"
            >
              <Check size={11} /> Enregistrer
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setDraft(note.content);
                setIsEditing(false);
              }}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground font-body"
            >
              <X size={11} /> Annuler
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs font-medium text-primary font-body"
            >
              <Pencil size={11} /> Modifier
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={confirmDelete}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground font-body disabled:opacity-50"
            >
              <Trash2 size={11} /> Supprimer
            </button>
          </>
        )}
        {href ? (
          <Link href={href} className="ml-auto text-xs font-medium text-primary font-body">
            Voir →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
