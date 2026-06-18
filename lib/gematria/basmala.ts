import { calculateVerseValue } from "./calculate";
import type { VerseCalculation } from "../types/gematria";

/** Texte de calcul de la basmala (text_uthmani_simple, PRD §7). */
export const BASMALA_TEXT_SIMPLE = "بسم الله الرحمن الرحيم";

/** Texte affiché de la basmala (text_uthmani vocalisé, PRD §7). */
export const BASMALA_TEXT_UTHMANI = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

/**
 * Sourate 1 (Al-Fatiha) : la basmala est déjà le verset 1 (PRD §9), pas de
 * basmala virtuelle à ajouter.
 */
const SURAHS_WITH_REAL_BASMALA_AS_VERSE_ONE = new Set([1]);

/**
 * Sourates 108-114 du MVP : pas de basmala numérotée, une basmala virtuelle
 * est ajoutée pour le calcul (PRD §9).
 */
const SURAHS_NEEDING_VIRTUAL_BASMALA = new Set([108, 109, 110, 111, 112, 113, 114]);

export function needsVirtualBasmala(surahNumber: number): boolean {
  return SURAHS_NEEDING_VIRTUAL_BASMALA.has(surahNumber);
}

export function hasRealBasmalaAsFirstVerse(surahNumber: number): boolean {
  return SURAHS_WITH_REAL_BASMALA_AS_VERSE_ONE.has(surahNumber);
}

let cachedBasmalaCalculation: VerseCalculation | null = null;

/**
 * Calcul de la basmala, mémoïsé (texte fixe, résultat toujours identique).
 * Calculé à partir de BASMALA_TEXT_UTHMANI (et non BASMALA_TEXT_SIMPLE) pour
 * rester cohérent avec le verset 1:1 réel d'Al-Fatiha, qui est désormais
 * calculé depuis text_uthmani (PRD §7, décision 2026-06-18) — les deux
 * doivent donner exactement le même total.
 */
export function calculateBasmalaValue(): VerseCalculation {
  if (!cachedBasmalaCalculation) {
    cachedBasmalaCalculation = calculateVerseValue(BASMALA_TEXT_UTHMANI);
  }
  return cachedBasmalaCalculation;
}

/**
 * Total d'une sourate (PRD §10). `verses` doit contenir les versets réels
 * numérotés (pour Al-Fatiha, verset 1 = basmala déjà inclus). `includeBasmala`
 * ajoute la valeur de la basmala en plus — à utiliser uniquement quand
 * `verses` ne contient pas déjà la basmala comme verset réel.
 */
export function calculateSurahTotal(
  verses: VerseCalculation[],
  includeBasmala: boolean
): number {
  const versesTotal = verses.reduce((sum, verse) => sum + verse.total, 0);
  return includeBasmala ? versesTotal + calculateBasmalaValue().total : versesTotal;
}
