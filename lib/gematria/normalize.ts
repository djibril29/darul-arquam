const WASLA_ALEF = "ٱ"; // ٱ
const REGULAR_ALEF = "ا"; // ا

/**
 * Voyelles arabes, shadda, sukun, alef suscrit (dagger alef) et signes
 * coraniques/tajwid + tatweel, exprimés en \u pour éviter toute ambiguïté
 * de rendu RTL dans le code source. Exclut volontairement les lettres
 * précomposées comme آ/أ/إ qui doivent survivre intactes (آ vaut 2 dans ce
 * système).
 *
 * ؐ-ؚ : signes coraniques honorifiques
 * ً-ْ : harakat, tanwin, shadda, sukun
 * ٓ-ٟ : marques combinantes arabes (maddah, hamza combinante, etc.)
 * ٰ        : alef suscrit (dagger alef, prosodique, non écrit)
 * ۖ-ۜ : petites marques hautes de récitation coranique
 * ۝-۞ : signes coraniques (fin de verset, rub el hizb)
 * ۟-ۨ : petites marques hautes/marques de récitation
 * ۪-ۭ : petites marques basses de récitation
 * ࣔ-࣡ : marques combinantes arabes étendues
 * ࣣ-ࣿ : signes d'annotation coranique étendus
 * ـ        : tatweel
 */
const DIACRITICS_AND_SYMBOLS_REGEX =
  /[ؐ-ًؚ-ٰٟۖ-ۭࣔ-ࣣ࣡-ࣿـ]/g;

export function stripDiacriticsAndSymbols(text: string): string {
  return text.replace(DIACRITICS_AND_SYMBOLS_REGEX, "");
}

export function convertWaslaAlef(text: string): string {
  return text.replaceAll(WASLA_ALEF, REGULAR_ALEF);
}

/**
 * Prépare le texte (text_uthmani_simple) pour le calcul (PRD §7) :
 * supprime voyelles/symboles/tajwid/tatweel, ne double pas la shadda
 * (elle est simplement retirée), conserve آ, convertit ٱ en ا.
 */
export function normalizeArabicText(text: string): string {
  return convertWaslaAlef(stripDiacriticsAndSymbols(text));
}
