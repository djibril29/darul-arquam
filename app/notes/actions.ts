"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createNote, updateNote, deleteNote } from "@/lib/supabase/notes";
import type { NoteType } from "@/lib/types/notes";

export async function createNoteAction(formData: FormData) {
  const noteType = String(formData.get("noteType") ?? "general") as NoteType;
  const content = String(formData.get("content") ?? "").trim();
  const surahNumberRaw = formData.get("surahNumber");
  const verseKeyRaw = formData.get("verseKey");
  const surahNumber = surahNumberRaw ? Number(surahNumberRaw) : null;
  const verseKey = verseKeyRaw ? String(verseKeyRaw) : null;

  if (!content) {
    const params = new URLSearchParams();
    if (surahNumber) params.set("surah", String(surahNumber));
    if (verseKey) params.set("verse", verseKey);
    params.set("error", "La note ne peut pas être vide.");
    redirect(`/notes/new?${params.toString()}`);
  }

  await createNote({ noteType, content, surahNumber, verseKey });

  revalidatePath("/notes");
  if (verseKey) {
    revalidatePath(`/verses/${verseKey}`);
    redirect(`/verses/${verseKey}`);
  }
  if (surahNumber) {
    revalidatePath(`/surahs/${surahNumber}`);
    redirect(`/surahs/${surahNumber}`);
  }
  redirect("/notes");
}

export async function updateNoteAction(id: string, content: string) {
  await updateNote(id, content);
  revalidatePath("/notes");
}

export async function deleteNoteAction(id: string) {
  await deleteNote(id);
  revalidatePath("/notes");
}
