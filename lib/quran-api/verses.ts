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

const VERSES_PER_PAGE = 50;

/**
 * Récupère les versets d'une sourate avec le texte uthmani (affichage),
 * le texte uthmani simple (calcul) et la traduction française. Le
 * découpage en mots/lettres n'est jamais demandé à l'API : il est fait
 * par notre propre moteur déterministe (/lib/gematria), jamais par l'API.
 * `words: true` est nécessaire pour récupérer la translittération
 * mot-par-mot (uniquement disponible à ce niveau, pas au niveau verset —
 * vérifié empiriquement le 2026-06-18).
 *
 * `findByChapter` est paginé côté API (`perPage`) et ne renvoie qu'un
 * `Verse[]` brut, sans métadonnées de pagination (pas de `totalPages`
 * exploitable) : on boucle donc page par page jusqu'à une page incomplète,
 * seule façon fiable de savoir qu'on a tout récupéré. Sans cette boucle,
 * toute sourate de plus de 50 versets était silencieusement tronquée à 50
 * (bug constaté le 2026-06-26 sur les sourates 51, 53, 54, 55, 56 — jamais
 * révélé par les 8 sourates du MVP, toutes ≤ 50 versets).
 */
export async function fetchSurahVerses(surahNumber: number, frenchTranslationResourceId: number) {
  const client = getQuranClient();
  const chapterId = toChapterId(surahNumber);
  const allVerses = [];

  for (let page = 1; ; page++) {
    const pageVerses = await client.verses.findByChapter(chapterId, {
      translations: [frenchTranslationResourceId],
      fields: { textUthmani: true, textUthmaniSimple: true },
      words: true,
      perPage: VERSES_PER_PAGE,
      page,
    });
    allVerses.push(...pageVerses);
    if (pageVerses.length < VERSES_PER_PAGE) break;
  }

  return allVerses;
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
