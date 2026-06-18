import { describe, it, expect } from "vitest";
import { computeVersePersonalValue, computeSurahPersonalValue } from "./cascade";
import type { VerseContent } from "@/lib/types/content";
import type { SurahOverridesData } from "@/lib/supabase/overrides";

function makeVerse(verseKey: string, words: number[]): VerseContent {
  return {
    verseKey,
    surahNumber: 108,
    verseNumber: Number(verseKey.split(":")[1]),
    textUthmani: "",
    frenchTranslation: null,
    totalValue: words.reduce((a, b) => a + b, 0),
    isBasmalaVirtual: false,
    words: words.map((value) => ({ word: "x", value })),
  };
}

const EMPTY_OVERRIDES: SurahOverridesData = {
  surahOverride: null,
  verseOverrides: {},
  wordOverrides: {},
};

describe("computeVersePersonalValue", () => {
  it("retourne la valeur calculée sans override actif", () => {
    const verse = makeVerse("108:1", [10, 20, 30]);
    const result = computeVersePersonalValue(verse, EMPTY_OVERRIDES);
    expect(result.total).toBe(60);
    expect(result.hasOverride).toBe(false);
    expect(result.isExplicit).toBe(false);
  });

  it("cascade : un override de mot remonte dans le total du verset", () => {
    const verse = makeVerse("108:1", [10, 20, 30]);
    const overrides: SurahOverridesData = {
      ...EMPTY_OVERRIDES,
      wordOverrides: { "108:1": { 1: { manualValue: 100, computedValue: 20, comment: null } } },
    };
    const result = computeVersePersonalValue(verse, overrides);
    expect(result.total).toBe(10 + 100 + 30);
    expect(result.hasOverride).toBe(true);
    expect(result.isExplicit).toBe(false);
    expect(result.words[1]).toEqual({ value: 100, hasOverride: true });
  });

  it("un override explicite du verset est prioritaire sur la cascade des mots", () => {
    const verse = makeVerse("108:1", [10, 20, 30]);
    const overrides: SurahOverridesData = {
      ...EMPTY_OVERRIDES,
      wordOverrides: { "108:1": { 0: { manualValue: 999, computedValue: 10, comment: null } } },
      verseOverrides: { "108:1": { manualValue: 777, computedValue: 60, comment: null } },
    };
    const result = computeVersePersonalValue(verse, overrides);
    expect(result.total).toBe(777);
    expect(result.isExplicit).toBe(true);
    // les mots restent visibles avec leur propre override, même si le total du
    // verset ne provient plus de leur somme
    expect(result.words[0]).toEqual({ value: 999, hasOverride: true });
  });
});

describe("computeSurahPersonalValue", () => {
  it("cascade : somme des valeurs personnelles de chaque verset", () => {
    const verses = [makeVerse("108:1", [10, 20]), makeVerse("108:2", [5, 5])];
    const overrides: SurahOverridesData = {
      ...EMPTY_OVERRIDES,
      wordOverrides: { "108:1": { 0: { manualValue: 100, computedValue: 10, comment: null } } },
    };
    const result = computeSurahPersonalValue(verses, overrides);
    expect(result.total).toBe(100 + 20 + 5 + 5);
    expect(result.hasOverride).toBe(true);
    expect(result.isExplicit).toBe(false);
  });

  it("un override explicite de la sourate est prioritaire sur toute la cascade", () => {
    const verses = [makeVerse("108:1", [10, 20])];
    const overrides: SurahOverridesData = {
      ...EMPTY_OVERRIDES,
      wordOverrides: { "108:1": { 0: { manualValue: 100, computedValue: 10, comment: null } } },
      surahOverride: { manualValue: 5000, computedValue: 30, comment: null },
    };
    const result = computeSurahPersonalValue(verses, overrides);
    expect(result.total).toBe(5000);
    expect(result.isExplicit).toBe(true);
  });

  it("sans aucun override, le total personnel égale le total calculé", () => {
    const verses = [makeVerse("108:1", [10, 20]), makeVerse("108:2", [5, 5])];
    const result = computeSurahPersonalValue(verses, EMPTY_OVERRIDES);
    expect(result.total).toBe(40);
    expect(result.hasOverride).toBe(false);
  });
});
