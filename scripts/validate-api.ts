process.loadEnvFile(".env.local");

import { fetchChapterMeta, fetchSurahVerses } from "../lib/quran-api/verses";
import { calculateVerseValue } from "../lib/gematria/calculate";

const FRENCH_TRANSLATION_RESOURCE_ID = Number(process.env.FRENCH_TRANSLATION_RESOURCE_ID);

/**
 * Script de validation manuelle de la connexion API (Phase 3) : récupère une
 * sourate réelle et vérifie que notre moteur de gématrie ne signale aucun
 * caractère inconnu sur du texte produit par l'API. Pas un test automatisé —
 * à lancer à la main (`pnpm exec tsx scripts/validate-api.ts`) après tout
 * changement de credentials/environnement.
 */
async function main() {
  console.log(`Environnement Quran Foundation actif : ${process.env.QF_ENVIRONMENT}`);
  console.log(`Resource ID traduction française : ${FRENCH_TRANSLATION_RESOURCE_ID}\n`);

  const meta = await fetchChapterMeta(112);
  console.log(`Sourate 112 : ${meta.nameSimple} (${meta.nameArabic}), ${meta.versesCount} versets`);

  const verses = await fetchSurahVerses(112, FRENCH_TRANSLATION_RESOURCE_ID);

  for (const v of verses) {
    const calculation = calculateVerseValue(v.textUthmaniSimple ?? "");
    console.log(
      `${v.verseKey}  total=${calculation.total}  caractères inconnus=${
        calculation.unknownCharacters.length ? calculation.unknownCharacters.join(",") : "(aucun)"
      }`
    );
    console.log(`  uthmani: ${v.textUthmani}`);
    console.log(`  simple : ${v.textUthmaniSimple}`);
    console.log(`  fr     : ${v.translations?.[0]?.text}`);
  }
}

main().catch((err) => {
  console.error("Erreur de validation API:", err);
  process.exit(1);
});
