export type LetterCalculation = {
  /** Lettre telle qu'écrite après suppression des voyelles/symboles, avant conversion ٱ→ا */
  letter: string;
  /** Lettre utilisée pour le calcul (après conversion ٱ→ا) */
  normalizedLetter: string;
  value: number;
};

export type WordCalculation = {
  word: string;
  normalizedWord: string;
  letters: LetterCalculation[];
  total: number;
};

export type VerseCalculation = {
  originalText: string;
  normalizedText: string;
  words: WordCalculation[];
  total: number;
  unknownCharacters: string[];
};
