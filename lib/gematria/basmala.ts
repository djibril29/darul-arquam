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
 * Sourate 9 (At-Tawbah) : pas de basmala du tout, ni réelle ni virtuelle —
 * la seule sourate du Coran dans ce cas. Décision produit du 2026-06-27 :
 * son total ne reçoit aucun ajout de basmala (`calculateSurahTotal(...,
 * false)`), `total_value_without_basmala` reste `null` (comme la sourate 1,
 * où la distinction avec/sans basmala n'a pas de sens).
 */
const SURAHS_WITHOUT_BASMALA = new Set([9]);

/**
 * Toute sourate importée a besoin d'une basmala virtuelle pour le calcul,
 * sauf la sourate 1 (basmala = vrai verset 1) et la sourate 9 (pas de
 * basmala du tout). Logique par exclusion plutôt qu'énumération : couvre
 * nativement chaque nouveau lot de sourates importé sans modifier ce fichier.
 */
export function needsVirtualBasmala(surahNumber: number): boolean {
  return !hasRealBasmalaAsFirstVerse(surahNumber) && !hasNoBasmalaAtAll(surahNumber);
}

export function hasRealBasmalaAsFirstVerse(surahNumber: number): boolean {
  return SURAHS_WITH_REAL_BASMALA_AS_VERSE_ONE.has(surahNumber);
}

export function hasNoBasmalaAtAll(surahNumber: number): boolean {
  return SURAHS_WITHOUT_BASMALA.has(surahNumber);
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
