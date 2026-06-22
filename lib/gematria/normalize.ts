const WASLA_ALEF = "ٱ"; // ٱ
const REGULAR_ALEF = "ا"; // ا
const DAGGER_ALEF = "ٰ"; // ٰ, alef suscrit
const ALEF_MAKSURA = "ى"; // ى

/**
 * Voyelles arabes, shadda, sukun et signes coraniques/tajwid + tatweel.
 * Exprime en \\uXXXX (pas en caracteres arabes bruts) car une classe de
 * caracteres regex melangeant lettres RTL et tirets de plage est sujette
 * au reordonnancement bidirectionnel a l affichage/copie - un piege deja
 * rencontre sur ce fichier (2026-06-18), verifie ici par un script Node
 * plutot que par relecture visuelle.
 *
 * Exclut volontairement les lettres precomposees comme آ/أ/إ qui doivent
 * survivre intactes (آ vaut 2 dans ce systeme), et l alef suscrit (U+0670,
 * voir convertDaggerAlef).
 *
 * Le petit waw (U+06E5) et le petit ya (U+06E6) restent volontairement
 * dans la liste de suppression : dans le corpus MVP, ils n apparaissent
 * QUE comme marque de silat sur un suffixe pronominal (ـهُۥ/ـهِۦ, ex.
 * "لَّهُۥ" = lahu), une nuance de recitation qui depend du contexte, pas
 * une lettre structurelle du mot - a la difference de l alef suscrit qui
 * marque une voyelle longue toujours presente (ex. "العالمين", "الرحمن").
 * Decision produit explicite (2026-06-18), apres correction d un premier
 * essai qui les traitait comme l alef suscrit a tort (لَّهُۥ calcule a 41
 * au lieu de 35).
 *
 * U+0610-U+061A : signes coraniques honorifiques
 * U+064B-U+065F : harakat, tanwin, shadda, sukun, marques combinantes
 * U+06D6-U+06ED : petites marques hautes/basses de recitation coranique
 * U+08D4-U+08E1, U+08E3-U+08FF : marques combinantes et signes annotation etendus
 * U+0640 : tatweel
 */
const DIACRITICS_AND_SYMBOLS_REGEX =
  /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF\u0640]/g;

export function stripDiacriticsAndSymbols(text: string): string {
  return text.replace(DIACRITICS_AND_SYMBOLS_REGEX, "");
}

export function convertWaslaAlef(text: string): string {
  return text.replaceAll(WASLA_ALEF, REGULAR_ALEF);
}

/**
 * Convertit l alef suscrit (voyelle longue structurelle du rasm coranique,
 * ex. "العالمين", "الرحمن") en alef plein (PRD section 7, decision 2026-06-18).
 */
export function convertDaggerAlef(text: string): string {
  return text.replaceAll(DAGGER_ALEF, REGULAR_ALEF);
}

/**
 * Retire l alef suscrit lorsqu il suit directement un ى (alef maksura).
 * Dans ce cas precis ("ىٰ", ex. "تولّىٰ", "استغنىٰ", "الذكرىٰ", tres frequent
 * dans la sourate 80), l alef suscrit ne fait que renforcer visuellement la
 * voyelle longue deja portee par le ى (lui-meme value 1) : ce n est pas un
 * second alef structurel, contrairement au cas ou l alef suscrit suit un
 * tatweel/une consonne sans aucune lettre de prolongation deja presente
 * (ex. "الرحمـٰن", "يـٰ" pour la particule vocative "يا" avec alef elide -
 * ce dernier cas reste converti en alef plein par convertDaggerAlef).
 * Decision produit explicite (2026-06-20), verifiee empiriquement : sur 290
 * occurrences d alef suscrit dans le corpus importe, 121 suivent un ى.
 */
export function collapseYaDaggerAlef(text: string): string {
  return text.replaceAll(ALEF_MAKSURA + DAGGER_ALEF, ALEF_MAKSURA);
}

/**
 * Prepare le texte (text_uthmani) pour le calcul (PRD section 7) : supprime
 * voyelles/symboles/tajwid/tatweel, ne double pas la shadda (elle est
 * simplement retiree), conserve آ, convertit ٱ en ا, retire l alef suscrit
 * redondant apres un ى, et convertit le reste de l alef suscrit en alef plein.
 */
export function normalizeArabicText(text: string): string {
  return convertDaggerAlef(
    collapseYaDaggerAlef(convertWaslaAlef(stripDiacriticsAndSymbols(text)))
  );
}
