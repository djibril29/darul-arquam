import type { VerseContent } from "@/lib/types/content";
import type { SurahOverridesData } from "@/lib/supabase/overrides";

export type WordPersonalValue = { value: number; hasOverride: boolean };

export type VersePersonalValue = {
  total: number;
  /** true si une valeur personnelle diffère du total calculé (override direct ou cascade de mots). */
  hasOverride: boolean;
  /** true si un override direct existe sur CE verset (prioritaire sur la cascade des mots). */
  isExplicit: boolean;
  words: WordPersonalValue[];
};

export type SurahPersonalValue = {
  total: number;
  hasOverride: boolean;
  isExplicit: boolean;
};

/**
 * Valeur personnelle d'un verset : un override explicite sur le verset est
 * prioritaire ; sinon la valeur personnelle est la somme des mots (valeur
 * perso si overridée, valeur calculée sinon) — CLAUDE.md règle d'or n°7 :
 * jamais d'écrasement de la valeur calculée, qui reste toujours disponible
 * à côté (verse.totalValue / word.value).
 */
export function computeVersePersonalValue(
  verse: VerseContent,
  overrides: SurahOverridesData
): VersePersonalValue {
  const wordOverridesForVerse = overrides.wordOverrides[verse.verseKey] ?? {};
  const words: WordPersonalValue[] = verse.words.map((word, position) => {
    const override = wordOverridesForVerse[position];
    return override
      ? { value: override.manualValue, hasOverride: true }
      : { value: word.value, hasOverride: false };
  });

  const explicitVerseOverride = overrides.verseOverrides[verse.verseKey];
  if (explicitVerseOverride) {
    return { total: explicitVerseOverride.manualValue, hasOverride: true, isExplicit: true, words };
  }

  const total = words.reduce((sum, w) => sum + w.value, 0);
  const hasOverride = words.some((w) => w.hasOverride);
  return { total, hasOverride, isExplicit: false, words };
}

/**
 * Valeur personnelle d'une sourate : un override explicite sur la sourate
 * est prioritaire ; sinon c'est la somme des valeurs personnelles de
 * chaque verset réel (cascade mot → verset → sourate).
 */
export function computeSurahPersonalValue(
  verses: VerseContent[],
  overrides: SurahOverridesData
): SurahPersonalValue {
  if (overrides.surahOverride) {
    return { total: overrides.surahOverride.manualValue, hasOverride: true, isExplicit: true };
  }

  const versePersonalValues = verses.map((verse) => computeVersePersonalValue(verse, overrides));
  const total = versePersonalValues.reduce((sum, v) => sum + v.total, 0);
  const hasOverride = versePersonalValues.some((v) => v.hasOverride);
  return { total, hasOverride, isExplicit: false };
}
