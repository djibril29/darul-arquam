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

  it("removes the dagger alef (superscript alef, U+0670)", () => {
    const withDaggerAlef = "ر" + "ٰ" + "ح";
    expect(normalizeArabicText(withDaggerAlef)).toBe("رح");
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
