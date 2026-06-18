import { describe, expect, it } from "vitest";
import {
  getLetterValue,
  calculateWordValue,
  calculateVerseValue,
  detectUnknownCharacters,
} from "./calculate";
import { BASMALA_TEXT_SIMPLE } from "./basmala";

describe("getLetterValue", () => {
  it("returns the mapped value for a known letter", () => {
    expect(getLetterValue("ب")).toBe(2);
    expect(getLetterValue("آ")).toBe(2);
    expect(getLetterValue("ا")).toBe(1);
  });

  it("returns 0 for an unmapped character", () => {
    expect(getLetterValue("x")).toBe(0);
    expect(getLetterValue("1")).toBe(0);
  });
});

describe("calculateWordValue", () => {
  it("converts ٱ to ا at the letter level and values it at 1", () => {
    const result = calculateWordValue("ٱلله");
    expect(result.letters[0].letter).toBe("ٱ");
    expect(result.letters[0].normalizedLetter).toBe("ا");
    expect(result.letters[0].value).toBe(1);
    expect(result.normalizedWord).toBe("الله");
  });

  it("strips diacritics before computing letters", () => {
    const result = calculateWordValue("بِسْمِ");
    expect(result.normalizedWord).toBe("بسم");
    expect(result.total).toBe(2 + 300 + 40); // ب + س + م
  });
});

describe("calculateVerseValue — Basmala (cas de référence)", () => {
  const result = calculateVerseValue(BASMALA_TEXT_SIMPLE);

  it("splits into 4 words", () => {
    expect(result.words).toHaveLength(4);
  });

  it("computes the known reference total of 1026", () => {
    // بسم (2+300+40=342) + الله (1+30+30+5=66) + الرحمن (1+30+200+8+40+50=329) + الرحيم (1+30+200+8+10+40=289) = 1026
    expect(result.total).toBe(1026);
  });

  it("is deterministic across repeated calls", () => {
    const again = calculateVerseValue(BASMALA_TEXT_SIMPLE);
    expect(again.total).toBe(result.total);
    expect(again).toEqual(result);
  });

  it("has no unknown characters", () => {
    expect(result.unknownCharacters).toEqual([]);
  });
});

describe("detectUnknownCharacters", () => {
  it("flags characters absent from the letter mapping", () => {
    const unknown = detectUnknownCharacters("ا ب x ?");
    expect(unknown).toContain("x");
    expect(unknown).toContain("?");
    expect(unknown).not.toContain("ا");
    expect(unknown).not.toContain(" ");
  });

  it("returns an empty array when every character is known", () => {
    expect(detectUnknownCharacters("ا ب ج")).toEqual([]);
  });
});
