process.loadEnvFile(".env.local");

import { fileURLToPath } from "node:url";
import { Language } from "@quranjs/api";
import { fetchChapterMeta, fetchSurahVerses } from "../lib/quran-api/verses";
import { getSupabaseAdminClient } from "../lib/supabase/admin";
import {
  calculateVerseValue,
  calculateSurahTotal,
  needsVirtualBasmala,
  hasRealBasmalaAsFirstVerse,
  BASMALA_TEXT_SIMPLE,
  BASMALA_TEXT_UTHMANI,
} from "../lib/gematria";
import type { VerseCalculation, WordCalculation } from "../lib/types/gematria";

/** PRD §2 : les 8 sourates du MVP. */
export const MVP_SURAH_NUMBERS = [1, 108, 109, 110, 111, 112, 113, 114];

const FRENCH_TRANSLATION_RESOURCE_ID = Number(process.env.FRENCH_TRANSLATION_RESOURCE_ID);

type ImportableVerse = {
  verseNumber: number;
  verseKey: string;
  textUthmani: string;
  textUthmaniSimple: string;
  frenchTranslation: string | null;
  isBasmalaVirtual: boolean;
};

async function upsertSurahMetadata(surahNumber: number): Promise<{ id: string }> {
  const [metaEnglish, metaFrench] = await Promise.all([
    fetchChapterMeta(surahNumber, Language.ENGLISH),
    fetchChapterMeta(surahNumber, Language.FRENCH),
  ]);
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("surahs")
    .upsert(
      {
        number: surahNumber,
        name_arabic: metaEnglish.nameArabic,
        name_latin: metaEnglish.nameSimple,
        name_english: metaEnglish.translatedName?.name ?? null,
        name_translated: metaFrench.translatedName?.name ?? null,
        revelation_place: metaEnglish.revelationPlace,
        verses_count: metaEnglish.versesCount,
      },
      { onConflict: "number" }
    )
    .select("id")
    .single();
  if (error) throw error;
  return data as { id: string };
}

/**
 * Construit la liste des versets à importer pour une sourate, en
 * préfixant par la basmala virtuelle (PRD §9) pour les sourates 108-114
 * qui n'ont pas la basmala comme verset numéroté.
 */
function buildImportableVerses(
  surahNumber: number,
  apiVerses: Awaited<ReturnType<typeof fetchSurahVerses>>
): ImportableVerse[] {
  const verses: ImportableVerse[] = [];

  if (needsVirtualBasmala(surahNumber)) {
    verses.push({
      verseNumber: 0,
      verseKey: `${surahNumber}:0`,
      textUthmani: BASMALA_TEXT_UTHMANI,
      textUthmaniSimple: BASMALA_TEXT_SIMPLE,
      frenchTranslation: null,
      isBasmalaVirtual: true,
    });
  }

  for (const verse of apiVerses) {
    verses.push({
      verseNumber: verse.verseNumber,
      verseKey: verse.verseKey,
      textUthmani: verse.textUthmani ?? "",
      textUthmaniSimple: verse.textUthmaniSimple ?? "",
      frenchTranslation: verse.translations?.[0]?.text ?? null,
      isBasmalaVirtual: false,
    });
  }

  return verses;
}

async function upsertVerse(
  surahId: string,
  surahNumber: number,
  verse: ImportableVerse,
  calculation: VerseCalculation
): Promise<{ id: string }> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("verses")
    .upsert(
      {
        surah_id: surahId,
        surah_number: surahNumber,
        verse_number: verse.verseNumber,
        verse_key: verse.verseKey,
        text_uthmani: verse.textUthmani,
        text_uthmani_simple: verse.textUthmaniSimple,
        normalized_text: calculation.normalizedText,
        french_translation: verse.frenchTranslation,
        total_value: calculation.total,
        is_basmala_virtual: verse.isBasmalaVirtual,
      },
      { onConflict: "verse_key" }
    )
    .select("id")
    .single();
  if (error) throw error;
  return data as { id: string };
}

async function upsertLetters(wordId: string, verseKey: string, wordPosition: number, word: WordCalculation) {
  const supabase = getSupabaseAdminClient();
  const rows = word.letters.map((letter, letterPosition) => ({
    word_id: wordId,
    verse_key: verseKey,
    word_position: wordPosition,
    letter_position: letterPosition,
    letter: letter.letter,
    normalized_letter: letter.normalizedLetter,
    numeric_value: letter.value,
  }));
  const { error } = await supabase
    .from("word_letters")
    .upsert(rows, { onConflict: "word_id,letter_position" });
  if (error) throw error;
}

async function upsertWords(verseId: string, verseKey: string, calculation: VerseCalculation) {
  const supabase = getSupabaseAdminClient();
  for (const [position, word] of calculation.words.entries()) {
    const { data, error } = await supabase
      .from("verse_words")
      .upsert(
        {
          verse_id: verseId,
          verse_key: verseKey,
          position,
          word_text: word.word,
          normalized_word: word.normalizedWord,
          total_value: word.total,
        },
        { onConflict: "verse_id,position" }
      )
      .select("id")
      .single();
    if (error) throw error;

    await upsertLetters((data as { id: string }).id, verseKey, position, word);
  }
}

/**
 * Calcule et persiste les totaux d'une sourate (PRD §9-10). `realVerseCalculations`
 * ne doit contenir que les versets réels numérotés, jamais la ligne de basmala
 * virtuelle (déjà comptée via `calculateSurahTotal(..., true)`).
 */
async function updateSurahTotals(
  surahId: string,
  surahNumber: number,
  realVerseCalculations: VerseCalculation[]
) {
  let withBasmala: number;
  let withoutBasmala: number | null;

  if (hasRealBasmalaAsFirstVerse(surahNumber)) {
    withBasmala = calculateSurahTotal(realVerseCalculations, false);
    withoutBasmala = null;
  } else if (needsVirtualBasmala(surahNumber)) {
    withBasmala = calculateSurahTotal(realVerseCalculations, true);
    withoutBasmala = calculateSurahTotal(realVerseCalculations, false);
  } else {
    throw new Error(
      `Règle de basmala non définie pour la sourate ${surahNumber} (hors MVP, voir CLAUDE.md règle d'or n°6).`
    );
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("surahs")
    .update({
      total_value_with_basmala: withBasmala,
      total_value_without_basmala: withoutBasmala,
    })
    .eq("id", surahId);
  if (error) throw error;
}

/**
 * Récupère une sourate depuis l'API Quran Foundation, calcule ses valeurs
 * via le moteur déterministe (/lib/gematria) et upsert en cascade dans
 * Supabase : surahs → verses → verse_words → word_letters, puis les totaux.
 */
export async function importSurah(surahNumber: number): Promise<void> {
  console.log(`\nImport sourate ${surahNumber}...`);

  const { id: surahId } = await upsertSurahMetadata(surahNumber);
  const apiVerses = await fetchSurahVerses(surahNumber, FRENCH_TRANSLATION_RESOURCE_ID);
  const importableVerses = buildImportableVerses(surahNumber, apiVerses);

  const realVerseCalculations: VerseCalculation[] = [];

  for (const verse of importableVerses) {
    const calculation = calculateVerseValue(verse.textUthmaniSimple);
    if (calculation.unknownCharacters.length > 0) {
      console.warn(
        `  ⚠ ${verse.verseKey} : caractères inconnus = ${calculation.unknownCharacters.join(", ")}`
      );
    }

    const { id: verseId } = await upsertVerse(surahId, surahNumber, verse, calculation);
    await upsertWords(verseId, verse.verseKey, calculation);

    if (!verse.isBasmalaVirtual) {
      realVerseCalculations.push(calculation);
    }

    console.log(`  ${verse.verseKey}  total=${calculation.total}`);
  }

  await updateSurahTotals(surahId, surahNumber, realVerseCalculations);
  console.log(`  Sourate ${surahNumber} importée (${importableVerses.length} verset(s) en base).`);
}

/** Importe uniquement les sourates du MVP (PRD §2, §14). */
export async function importMvpSurahs(): Promise<void> {
  for (const surahNumber of MVP_SURAH_NUMBERS) {
    await importSurah(surahNumber);
  }
  console.log("\nImport MVP terminé.");
}

/**
 * Recalcule les valeurs à partir des textes déjà stockés dans Supabase,
 * sans rappeler l'API externe (CLAUDE.md règle d'or n°2). Doit redonner
 * exactement les mêmes totaux que l'import initial.
 */
export async function recalculateValues(): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { data: surahs, error: surahsError } = await supabase
    .from("surahs")
    .select("id, number");
  if (surahsError) throw surahsError;

  for (const surah of (surahs ?? []) as { id: string; number: number }[]) {
    console.log(`\nRecalcul sourate ${surah.number}...`);

    const { data: verses, error: versesError } = await supabase
      .from("verses")
      .select("id, verse_key, verse_number, text_uthmani_simple, is_basmala_virtual")
      .eq("surah_id", surah.id)
      .order("verse_number", { ascending: true });
    if (versesError) throw versesError;

    const realVerseCalculations: VerseCalculation[] = [];

    for (const verse of (verses ?? []) as {
      id: string;
      verse_key: string;
      verse_number: number;
      text_uthmani_simple: string;
      is_basmala_virtual: boolean;
    }[]) {
      const calculation = calculateVerseValue(verse.text_uthmani_simple);

      const { error: updateError } = await supabase
        .from("verses")
        .update({
          normalized_text: calculation.normalizedText,
          total_value: calculation.total,
        })
        .eq("id", verse.id);
      if (updateError) throw updateError;

      await upsertWords(verse.id, verse.verse_key, calculation);

      if (!verse.is_basmala_virtual) {
        realVerseCalculations.push(calculation);
      }

      console.log(`  ${verse.verse_key}  total=${calculation.total}`);
    }

    await updateSurahTotals(surah.id, surah.number, realVerseCalculations);
  }

  console.log("\nRecalcul terminé.");
}

async function main() {
  const command = process.argv[2] ?? "import-mvp";

  if (command === "import-mvp") {
    await importMvpSurahs();
  } else if (command === "recalculate") {
    await recalculateValues();
  } else if (command === "import-surah") {
    const surahNumber = Number(process.argv[3]);
    if (!surahNumber) {
      throw new Error("Usage : tsx scripts/import.ts import-surah <numero>");
    }
    await importSurah(surahNumber);
  } else {
    throw new Error(`Commande inconnue : ${command}`);
  }
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((err) => {
    console.error("Erreur d'import :", err);
    process.exit(1);
  });
}
