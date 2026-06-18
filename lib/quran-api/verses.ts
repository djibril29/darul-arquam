import { isValidChapterId, Language } from "@quranjs/api";
import { getQuranClient } from "./client";

function toChapterId(surahNumber: number) {
  const id = String(surahNumber);
  if (!isValidChapterId(id)) {
    throw new Error(`Numéro de sourate invalide : ${surahNumber} (doit être entre 1 et 114).`);
  }
  return id;
}

/**
 * Récupère les versets d'une sourate avec le texte uthmani (affichage),
 * le texte uthmani simple (calcul) et la traduction française. Le
 * découpage en mots/lettres n'est jamais demandé à l'API : il est fait
 * par notre propre moteur déterministe (/lib/gematria), jamais par l'API.
 */
export async function fetchSurahVerses(surahNumber: number, frenchTranslationResourceId: number) {
  const client = getQuranClient();
  return client.verses.findByChapter(toChapterId(surahNumber), {
    translations: [frenchTranslationResourceId],
    fields: { textUthmani: true, textUthmaniSimple: true },
    perPage: 50,
  });
}

/**
 * Métadonnées d'une sourate (nom arabe/latin, nb de versets, lieu de révélation...).
 * `language` est passé explicitement car `translatedName` revient sinon dans
 * une langue incohérente selon la sourate (vérifié empiriquement, contrairement
 * au filtre `language` des traductions qui est silencieusement ignoré par l'API).
 */
export async function fetchChapterMeta(surahNumber: number, language: Language = Language.ENGLISH) {
  const client = getQuranClient();
  return client.chapters.findById(toChapterId(surahNumber), { language });
}
