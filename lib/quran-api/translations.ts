import { Language } from "@quranjs/api";
import { getQuranClient } from "./client";

/**
 * Liste les traductions disponibles en français, pour choisir manuellement
 * FRENCH_TRANSLATION_RESOURCE_ID (PRD §5) — jamais deviné.
 */
export async function findFrenchTranslations() {
  const client = getQuranClient();
  return client.resources.findAllTranslations({ language: Language.FRENCH });
}
