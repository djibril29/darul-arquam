import { createSupabaseServerClient } from "./server";
import type { NoteSummary, NoteType } from "@/lib/types/notes";

type NoteRow = {
  id: string;
  note_type: NoteType;
  content: string;
  created_at: string;
  surahs: { number: number } | null;
  verses: { verse_key: string; surah_number: number } | null;
};

function mapNoteRow(row: NoteRow): NoteSummary {
  return {
    id: row.id,
    noteType: row.note_type,
    surahNumber: row.verses?.surah_number ?? row.surahs?.number ?? null,
    verseKey: row.verses?.verse_key ?? null,
    content: row.content,
    createdAt: row.created_at,
  };
}

/** Notes de l'utilisateur authentifié (RLS : auth.uid() = user_id). */
export async function getUserNotes(): Promise<NoteSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_notes")
    .select("id, note_type, content, created_at, surahs(number), verses(verse_key, surah_number)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapNoteRow(row as unknown as NoteRow));
}

export type CreateNoteInput = {
  noteType: NoteType;
  content: string;
  surahNumber?: number | null;
  verseKey?: string | null;
};

export async function createNote(input: CreateNoteInput): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  let surahId: string | null = null;
  let verseId: string | null = null;

  if (input.verseKey) {
    const { data: verseRow, error } = await supabase
      .from("verses")
      .select("id, surah_id")
      .eq("verse_key", input.verseKey)
      .single();
    if (error) throw error;
    verseId = verseRow.id;
    surahId = verseRow.surah_id;
  } else if (input.surahNumber) {
    const { data: surahRow, error } = await supabase
      .from("surahs")
      .select("id")
      .eq("number", input.surahNumber)
      .single();
    if (error) throw error;
    surahId = surahRow.id;
  }

  const { error: insertError } = await supabase.from("user_notes").insert({
    user_id: user.id,
    surah_id: surahId,
    verse_id: verseId,
    note_type: input.noteType,
    content: input.content,
  });
  if (insertError) throw insertError;
}

export async function updateNote(id: string, content: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_notes")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("user_notes").delete().eq("id", id);
  if (error) throw error;
}
