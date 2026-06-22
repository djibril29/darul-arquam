import { describe, expect, it } from "vitest";
import {
  needsVirtualBasmala,
  hasRealBasmalaAsFirstVerse,
  calculateBasmalaValue,
  calculateSurahTotal,
} from "./basmala";
import { calculateVerseValue } from "./calculate";

describe("basmala rules (PRD §9)", () => {
  it("Al-Fatiha (1) has the basmala as a real first verse", () => {
    expect(hasRealBasmalaAsFirstVerse(1)).toBe(true);
    expect(needsVirtualBasmala(1)).toBe(false);
  });

  it("surahs 108-114 need a virtual basmala", () => {
    for (const surah of [108, 109, 110, 111, 112, 113, 114]) {
      expect(needsVirtualBasmala(surah)).toBe(true);
      expect(hasRealBasmalaAsFirstVerse(surah)).toBe(false);
    }
  });

  it("surahs 80-107 (new batch) also need a virtual basmala", () => {
    for (let surah = 80; surah <= 107; surah++) {
      expect(needsVirtualBasmala(surah)).toBe(true);
      expect(hasRealBasmalaAsFirstVerse(surah)).toBe(false);
    }
  });

  it("every surah needs a virtual basmala except 1 and 9 (exclusion-based rule)", () => {
    for (let surah = 2; surah <= 114; surah++) {
      if (surah === 9) continue;
      expect(needsVirtualBasmala(surah)).toBe(true);
    }
  });

  it("surah 9 (out of MVP) is neither — reserved for a future explicit rule", () => {
    expect(needsVirtualBasmala(9)).toBe(false);
    expect(hasRealBasmalaAsFirstVerse(9)).toBe(false);
  });

  it("calculateBasmalaValue is memoized and deterministic", () => {
    const a = calculateBasmalaValue();
    const b = calculateBasmalaValue();
    expect(a).toBe(b); // same object reference (memoized)
    // 1026 (texte sans diacritiques) + 1 pour l'alef suscrit de "ٱلرَّحْمَـٰنِ",
    // compté comme une vraie lettre depuis le 2026-06-18 (décision produit).
    expect(a.total).toBe(1027);
  });
});

describe("calculateSurahTotal", () => {
  const verseA = calculateVerseValue("ب"); // total = 2
  const verseB = calculateVerseValue("ج"); // total = 3

  it("sums verses without basmala when includeBasmala is false", () => {
    expect(calculateSurahTotal([verseA, verseB], false)).toBe(5);
  });

  it("adds the basmala total on top when includeBasmala is true", () => {
    expect(calculateSurahTotal([verseA, verseB], true)).toBe(5 + 1027);
  });
});
