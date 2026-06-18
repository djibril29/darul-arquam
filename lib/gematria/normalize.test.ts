import { describe, expect, it } from "vitest";
import { normalizeArabicText, convertWaslaAlef } from "./normalize";
import { BASMALA_TEXT_SIMPLE } from "./basmala";

describe("normalizeArabicText", () => {
  it("removes harakat (fatha, kasra, damma, sukun)", () => {
    const withHarakat = "بَ" + "ِ" + "ْ"; // ب + fatha + kasra + sukun
    expect(normalizeArabicText(withHarakat)).toBe("ب");
  });

  it("removes shadda without doubling the letter", () => {
    const withShadda = "ب" + "ّ"; // ب + shadda
    const result = normalizeArabicText(withShadda);
    expect(result).toBe("ب");
    expect(result.length).toBe(1);
  });

  it("removes tatweel", () => {
    const withTatweel = "ا" + "ـ" + "ل" + "ـ" + "له";
    expect(normalizeArabicText(withTatweel)).toBe("الله");
  });

  it("converts the dagger alef (superscript alef, U+0670) to a regular alef", () => {
    const withDaggerAlef = "ر" + "ٰ" + "ح";
    expect(normalizeArabicText(withDaggerAlef)).toBe("راح");
  });

  it("removes the small waw (U+06E5) — silat mark on a pronoun suffix, not a structural letter", () => {
    const withSmallWaw = "د" + "ۥ" + "د";
    expect(normalizeArabicText(withSmallWaw)).toBe("دد");
  });

  it("removes the small yeh (U+06E6) — same silat-mark reasoning as the small waw", () => {
    const withSmallYeh = "ب" + "ۦ" + "س";
    expect(normalizeArabicText(withSmallYeh)).toBe("بس");
  });

  it("converts ٱ (wasla) to ا", () => {
    expect(convertWaslaAlef("ٱ")).toBe("ا");
    expect(normalizeArabicText("ٱ")).toBe("ا");
  });

  it("does NOT transform آ into ا (آ is worth 2, distinct from ا which is worth 1)", () => {
    expect(normalizeArabicText("آ")).toBe("آ");
  });

  it("leaves already-clean text untouched", () => {
    expect(normalizeArabicText(BASMALA_TEXT_SIMPLE)).toBe(BASMALA_TEXT_SIMPLE);
  });
});
