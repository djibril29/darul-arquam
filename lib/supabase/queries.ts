import { createSupabaseServerClient } from "./server";
import type { SurahSummary, VerseContent, VerseWord, RevelationPlace } from "@/lib/types/content";

function toRevelationPlace(raw: string | null): RevelationPlace {
  return raw === "madinah" ? "Médinoise" : "Mecquoise";
}

type SurahRow = {
  id: string;
  number: number;
  name_arabic: string | null;
  name_latin: string | null;
  name_translated: string | null;
  revelation_place: string | null;
  verses_count: number | null;
  total_value_with_basmala: number | null;
  total_value_without_basmala: number | null;
};

function mapSurahRow(row: SurahRow, hasContent: boolean): SurahSummary {
  return {
    number: row.number,
    nameArabic: row.name_arabic ?? "",
    nameLatin: row.name_latin ?? "",
    nameTranslated: row.name_translated ?? "",
    revelationPlace: toRevelationPlace(row.revelation_place),
    versesCount: row.verses_count ?? 0,
    totalValueWithBasmala: row.total_value_with_basmala,
    totalValueWithoutBasmala: row.total_value_without_basmala,
    hasContent,
  };
}

const SELECT_PAGE_SIZE = 1000;

/**
 * Récupère toutes les valeurs d'une colonne sur une table, en paginant
 * explicitement (`.range()`). Un `.select()` sans pagination est limité à
 * 1000 lignes par défaut côté PostgREST/Supabase, sans erreur ni avertissement
 * — silencieusement tronqué. Sur `verses` (~4000 lignes), ça faisait
 * apparaître 67 sourates sur 96 comme « pas encore importées » alors
 * qu'elles l'étaient (constaté le 2026-06-27).
 */
async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; ; from += SELECT_PAGE_SIZE) {
    const { data, error } = await query(from, from + SELECT_PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < SELECT_PAGE_SIZE) break;
  }
  return all;
}

/** Couche d'accès aux données réelle (Phase 6) — mêmes signatures que la
 * couche mockée de la Phase 2 (désormais async, Supabase oblige). */
export async function getSurahs(): Promise<SurahSummary[]> {
  const supabase = await createSupabaseServerClient();

  const [{ data: surahRows, error: surahsError }, verseRows] = await Promise.all([
    supabase.from("surahs").select("*").order("number"),
    fetchAllRows<{ surah_id: string }>((from, to) =>
      supabase.from("verses").select("surah_id").range(from, to)
    ),
  ]);
  if (surahsError) throw surahsError;

  const surahIdsWithContent = new Set(verseRows.map((v) => v.surah_id));

  return (surahRows ?? []).map((row: SurahRow) => mapSurahRow(row, surahIdsWithContent.has(row.id)));
}

export async function getSurahByNumber(number: number): Promise<SurahSummary | null> {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("surahs")
    .select("*")
    .eq("number", number)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const { count, error: countError } = await supabase
    .from("verses")
    .select("id", { count: "exact", head: true })
    .eq("surah_id", row.id);
  if (countError) throw countError;

  return mapSurahRow(row, (count ?? 0) > 0);
}

export async function getSurahNameByNumber(surahNumber: number): Promise<string> {
  const surah = await getSurahByNumber(surahNumber);
  return surah?.nameLatin ?? `Sourate ${surahNumber}`;
}

type VerseWordRow = {
  word_text: string;
  total_value: number;
  position: number;
  transliteration: string | null;
};
type VerseRow = {
  surah_number: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  french_translation: string | null;
  total_value: number;
  is_basmala_virtual: boolean;
  verse_words: VerseWordRow[];
};

/** Concatène les translittérations des mots dans l'ordre ; null si aucune n'existe. */
function joinTransliterations(words: { transliteration: string | null }[]): string | null {
  const parts = words.map((w) => w.transliteration).filter((t): t is string => Boolean(t));
  return parts.length > 0 ? parts.join(" ") : null;
}

function mapVerseRow(row: VerseRow): VerseContent {
  const sortedWordRows = [...row.verse_words].sort((a, b) => a.position - b.position);
  const words: VerseWord[] = sortedWordRows.map((w) => ({
    word: w.word_text,
    value: w.total_value,
    transliteration: w.transliteration,
  }));

  return {
    verseKey: row.verse_key,
    surahNumber: row.surah_number,
    verseNumber: row.verse_number,
    textUthmani: row.text_uthmani,
    frenchTranslation: row.french_translation,
    transliteration: joinTransliterations(sortedWordRows),
    totalValue: row.total_value,
    isBasmalaVirtual: row.is_basmala_virtual,
    words,
  };
}

const VERSE_SELECT = "*, verse_words(word_text, total_value, position, transliteration)";

export async function getVersesBySurah(surahNumber: number): Promise<VerseContent[]> {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("verses")
    .select(VERSE_SELECT)
    .eq("surah_number", surahNumber)
    .eq("is_basmala_virtual", false)
    .order("verse_number");
  if (error) throw error;
  return (rows ?? []).map((row) => mapVerseRow(row as unknown as VerseRow));
}

export async function getVerseByKey(verseKey: string): Promise<VerseContent | null> {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("verses")
    .select(VERSE_SELECT)
    .eq("verse_key", verseKey)
    .maybeSingle();
  if (error) throw error;
  return row ? mapVerseRow(row as unknown as VerseRow) : null;
}

export type SearchResults = {
  verses: (VerseContent & { surahName: string })[];
  words: {
    word: string;
    value: number;
    transliteration: string | null;
    verseKey: string;
    surahNumber: number;
    surahName: string;
  }[];
  surahs: SurahSummary[];
};

export async function searchByNumber(value: number): Promise<SearchResults> {
  const supabase = await createSupabaseServerClient();

  const [{ data: verseRows, error: versesError }, { data: surahRows, error: surahsError }] =
    await Promise.all([
      supabase
        .from("verses")
        .select(`${VERSE_SELECT}, surahs(name_latin)`)
        .eq("total_value", value)
        .eq("is_basmala_virtual", false),
      supabase
        .from("surahs")
        .select("*")
        .or(`total_value_with_basmala.eq.${value},total_value_without_basmala.eq.${value}`),
    ]);
  if (versesError) throw versesError;
  if (surahsError) throw surahsError;

  const verses = (verseRows ?? []).map((row) => {
    const typedRow = row as unknown as VerseRow & { surahs: { name_latin: string } | null };
    return {
      ...mapVerseRow(typedRow),
      surahName: typedRow.surahs?.name_latin ?? `Sourate ${typedRow.surah_number}`,
    };
  });

  const { data: wordRows, error: wordsError } = await supabase
    .from("verse_words")
    .select("word_text, total_value, transliteration, verse_key, verses(surah_number, surahs(name_latin))")
    .eq("total_value", value);
  if (wordsError) throw wordsError;

  type WordRow = {
    word_text: string;
    total_value: number;
    transliteration: string | null;
    verse_key: string;
    verses: { surah_number: number; surahs: { name_latin: string } | null } | null;
  };

  const words = (wordRows ?? []).map((row) => {
    const typedRow = row as unknown as WordRow;
    return {
      word: typedRow.word_text,
      value: typedRow.total_value,
      transliteration: typedRow.transliteration,
      verseKey: typedRow.verse_key,
      surahNumber: typedRow.verses?.surah_number ?? 0,
      surahName: typedRow.verses?.surahs?.name_latin ?? `Sourate ${typedRow.verses?.surah_number ?? "?"}`,
    };
  });

  const surahs = (surahRows ?? []).map((row: SurahRow) => mapSurahRow(row, true));

  return { verses, words, surahs };
}
