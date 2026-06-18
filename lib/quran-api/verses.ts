import { isValidChapterId, Language } from "@quranjs/api";
import type { Verse } from "@quranjs/api";
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
 * `words: true` est nécessaire pour récupérer la translittération
 * mot-par-mot (uniquement disponible à ce niveau, pas au niveau verset —
 * vérifié empiriquement le 2026-06-18).
 */
export async function fetchSurahVerses(surahNumber: number, frenchTranslationResourceId: number) {
  const client = getQuranClient();
  return client.verses.findByChapter(toChapterId(surahNumber), {
    translations: [frenchTranslationResourceId],
    fields: { textUthmani: true, textUthmaniSimple: true },
    words: true,
    perPage: 50,
  });
}

/**
 * Extrait la translittération anglaise de chaque mot d'un verset, dans
 * l'ordre (PRD §7 — jamais utilisée pour le calcul, uniquement pour
 * l'affichage). Les entrées renvoyées par l'API qui ne sont pas des mots
 * (marqueur de fin de verset, etc.) sont ignorées via `charTypeName`.
 */
export function extractWordTransliterations(verse: Verse): string[] {
  return (verse.words ?? [])
    .filter((w) => w.charTypeName === "word")
    .sort((a, b) => a.position - b.position)
    .map((w) => w.transliteration?.text ?? "");
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
