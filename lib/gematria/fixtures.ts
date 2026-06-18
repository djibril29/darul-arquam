import { calculateVerseValue } from "./calculate";
import { BASMALA_TEXT_SIMPLE, BASMALA_TEXT_UTHMANI } from "./basmala";
import type { VerseCalculation } from "../types/gematria";

export type VerseFixture = {
  verseKey: string;
  textUthmani: string;
  textUthmaniSimple: string;
  frenchTranslation: string;
  calculation: VerseCalculation;
};

/**
 * Donnée d'exemple écrite à la main (sourcée verbatim depuis le PRD, pas
 * retapée de mémoire) pour alimenter l'UI en Phase 2, avant que l'import
 * réel (Phase 5) ne remplace ces données par celles de Supabase. Ne pas
 * ajouter d'autres versets ici à la main : la précision du texte coranique
 * doit venir de l'API, pas d'une saisie manuelle.
 */
export const FIXTURE_VERSES: VerseFixture[] = [
  {
    verseKey: "1:1",
    textUthmani: BASMALA_TEXT_UTHMANI,
    textUthmaniSimple: BASMALA_TEXT_SIMPLE,
    frenchTranslation:
      "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
    calculation: calculateVerseValue(BASMALA_TEXT_SIMPLE),
  },
];
