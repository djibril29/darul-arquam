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

/** Forme renvoyée par `select("*, verses(count)")` : un agrégat par sourate. */
type SurahRowWithCount = SurahRow & { verses: { count: number }[] | null };

function verseCountOf(row: SurahRowWithCount): number {
  return row.verses?.[0]?.count ?? 0;
}

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

/** Couche d'accès aux données réelle (Phase 6) — mêmes signatures que la
 * couche mockée de la Phase 2 (désormais async, Supabase oblige). */
/**
 * Liste des sourates, avec l'indicateur « contenu importé ».
 *
 * Le compte des versets est demandé à Postgres (`verses(count)`) au lieu de
 * rapatrier les lignes : la version précédente paginait les ~6 300
 * `verses.surah_id` en 8 aller-retours pour n'en tirer qu'un booléen — 2 606 ms
 * mesurés, contre 546 ms ici. Cette fonction est appelée par l'accueil, /surahs,
 * /notes et /profile : le coût était payé quatre fois.
 *
 * Ne jamais revenir à un `.select()` non paginé sur `verses` : PostgREST tronque
 * silencieusement à 1000 lignes, ce qui avait fait passer 67 sourates pourtant
 * importées pour « pas encore importées » (2026-06-27). L'agrégat est immunisé,
 * il ne renvoie qu'une ligne par sourate.
 */
export async function getSurahs(): Promise<SurahSummary[]> {
  const supabase = await createSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("surahs")
    .select("*, verses(count)")
    .order("number");
  if (error) throw error;

  return (rows ?? []).map((row) => {
    const typed = row as unknown as SurahRowWithCount;
    return mapSurahRow(typed, verseCountOf(typed) > 0);
  });
}

export async function getSurahByNumber(number: number): Promise<SurahSummary | null> {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("surahs")
    .select("*, verses(count)")
    .eq("number", number)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const typed = row as unknown as SurahRowWithCount;
  return mapSurahRow(typed, verseCountOf(typed) > 0);
}

export async function getSurahNameByNumber(surahNumber: number): Promise<string> {
  const surah = await getSurahByNumber(surahNumber);
  return surah?.nameLatin ?? `Sourate ${surahNumber}`;
}

type VerseWordRow = {
  word_text: string;
  total_value: number;
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
  // Tri et filtrage sont délégués à Postgres (voir `withOrderedWords`), donc
  // `verse_words` arrive déjà ordonné par position et sans les tokens vides.
  const wordRows = row.verse_words ?? [];
  const words: VerseWord[] = wordRows.map((w) => ({
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
    transliteration: joinTransliterations(wordRows),
    totalValue: row.total_value,
    isBasmalaVirtual: row.is_basmala_virtual,
    words,
  };
}

const VERSE_SELECT = "*, verse_words(word_text, total_value, transliteration)";

/**
 * Applique à une requête sur `verses` le tri et le filtrage des mots imbriqués.
 *
 * `normalized_word` vide correspond aux signes de lecture coraniques (ۗ ۖ ۚ ۛ)
 * que l'import séparait comme des mots ; ils ne doivent jamais s'afficher
 * (fix du 2026-07-03). Filtrer et trier ici plutôt qu'en JavaScript évite de
 * transférer `normalized_word` et `position`, inutiles à l'affichage.
 *
 * Vérifié sur les sourates 1, 2, 9 et 112 : un filtre sur une ressource
 * imbriquée ne retire que les mots concernés, jamais le verset parent — les
 * séquences obtenues sont identiques à celles du tri JavaScript précédent.
 */
function withOrderedWords<T extends {
  neq: (column: string, value: string) => T;
  order: (column: string, options?: { referencedTable?: string }) => T;
}>(query: T): T {
  return query
    .neq("verse_words.normalized_word", "")
    .order("position", { referencedTable: "verse_words" });
}

export async function getVersesBySurah(surahNumber: number): Promise<VerseContent[]> {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await withOrderedWords(
    supabase
      .from("verses")
      .select(VERSE_SELECT)
      .eq("surah_number", surahNumber)
      .eq("is_basmala_virtual", false)
      .order("verse_number")
  );
  if (error) throw error;
  return (rows ?? []).map((row) => mapVerseRow(row as unknown as VerseRow));
}

export async function getVerseByKey(verseKey: string): Promise<VerseContent | null> {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await withOrderedWords(
    supabase.from("verses").select(VERSE_SELECT).eq("verse_key", verseKey)
  ).maybeSingle();
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
      withOrderedWords(
        supabase
          .from("verses")
          .select(`${VERSE_SELECT}, surahs(name_latin)`)
          .eq("total_value", value)
          .eq("is_basmala_virtual", false)
      ),
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
