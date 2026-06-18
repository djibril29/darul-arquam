import { LETTER_VALUES } from "./letterValues";
import { stripDiacriticsAndSymbols, convertWaslaAlef } from "./normalize";
import { splitVerseIntoWords, splitWordIntoLetters } from "./split";
import type {
  LetterCalculation,
  WordCalculation,
  VerseCalculation,
} from "../types/gematria";

export function getLetterValue(letter: string): number {
  return LETTER_VALUES[letter] ?? 0;
}

export function calculateWordValue(word: string): WordCalculation {
  const strippedWord = stripDiacriticsAndSymbols(word);
  const letters: LetterCalculation[] = splitWordIntoLetters(strippedWord).map(
    (letter) => {
      const normalizedLetter = convertWaslaAlef(letter);
      return {
        letter,
        normalizedLetter,
        value: getLetterValue(normalizedLetter),
      };
    }
  );
  const normalizedWord = letters.map((l) => l.normalizedLetter).join("");
  const total = letters.reduce((sum, l) => sum + l.value, 0);

  return { word, normalizedWord, letters, total };
}

export function calculateVerseValue(verseText: string): VerseCalculation {
  const words = splitVerseIntoWords(verseText).map(calculateWordValue);
  const normalizedText = words.map((w) => w.normalizedWord).join(" ");
  const total = words.reduce((sum, w) => sum + w.total, 0);
  const unknownCharacters = detectUnknownCharacters(normalizedText);

  return { originalText: verseText, normalizedText, words, total, unknownCharacters };
}

/**
 * Détecte les caractères du texte normalisé absents du mapping (PRD §10).
 * Les espaces ne sont pas des lettres et sont ignorés.
 */
export function detectUnknownCharacters(normalizedText: string): string[] {
  const unknown = new Set<string>();
  for (const char of normalizedText) {
    if (char === " ") continue;
    if (!(char in LETTER_VALUES)) {
      unknown.add(char);
    }
  }
  if (unknown.size > 0) {
    console.warn(
      `[gematria] Caractère(s) inconnu(s) détecté(s): ${Array.from(unknown).join(", ")}`
    );
  }
  return Array.from(unknown);
}
