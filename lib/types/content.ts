export type RevelationPlace = "Mecquoise" | "Médinoise";

export type SurahSummary = {
  number: number;
  nameArabic: string;
  nameLatin: string;
  nameTranslated: string;
  revelationPlace: RevelationPlace;
  versesCount: number;
  /** null si la sourate n'a pas encore été importée (pas de contenu verset par verset). */
  totalValueWithBasmala: number | null;
  totalValueWithoutBasmala: number | null;
  hasContent: boolean;
};

export type VerseWord = {
  word: string;
  value: number;
};

export type VerseContent = {
  verseKey: string;
  surahNumber: number;
  verseNumber: number;
  textUthmani: string;
  /** null pour la basmala virtuelle (108-114), qui n'est pas un verset traduit. */
  frenchTranslation: string | null;
  totalValue: number;
  isBasmalaVirtual: boolean;
  words: VerseWord[];
};
