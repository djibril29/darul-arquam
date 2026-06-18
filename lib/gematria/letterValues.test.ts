import { describe, expect, it } from "vitest";
import { LETTER_VALUES } from "./letterValues";

describe("LETTER_VALUES", () => {
  it("matches the full mapping table from the PRD (§8)", () => {
    expect(LETTER_VALUES).toEqual({
      "ا": 1, // ا
      "أ": 1, // أ
      "إ": 1, // إ
      "ٱ": 1, // ٱ
      "ء": 1, // ء
      "ؤ": 1, // ؤ
      "ئ": 1, // ئ
      "ى": 1, // ى
      "آ": 2, // آ
      "ب": 2, // ب
      "ج": 3, // ج
      "د": 4, // د
      "ه": 5, // ه
      "و": 6, // و
      "ز": 7, // ز
      "ح": 8, // ح
      "ط": 9, // ط
      "ي": 10, // ي
      "ك": 20, // ك
      "ل": 30, // ل
      "م": 40, // م
      "ن": 50, // ن
      "ص": 60, // ص
      "ع": 70, // ع
      "ف": 80, // ف
      "ض": 90, // ض
      "ق": 100, // ق
      "ر": 200, // ر
      "س": 300, // س
      "ت": 400, // ت
      "ة": 400, // ة
      "ث": 500, // ث
      "خ": 600, // خ
      "ذ": 700, // ذ
      "ظ": 800, // ظ
      "غ": 900, // غ
      "ش": 1000, // ش
    });
  });

  it("gives آ (U+0622) a different value than the other alef forms", () => {
    expect(LETTER_VALUES["آ"]).toBe(2);
    expect(LETTER_VALUES["ا"]).toBe(1);
    expect(LETTER_VALUES["ٱ"]).toBe(1);
  });
});
