export type NoteType = "verse" | "surah" | "general";

export type NoteSummary = {
  id: string;
  noteType: NoteType;
  surahNumber: number | null;
  verseKey: string | null;
  content: string;
  createdAt: string;
};
