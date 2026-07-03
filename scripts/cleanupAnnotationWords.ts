/**
 * Supprime les entrées verse_words créées à partir de tokens purement
 * composés de signes de lecture coraniques (ۖ ۗ ۚ ۛ U+06D6-U+06ED).
 * Ces tokens apparaissent séparés par des espaces dans text_uthmani,
 * ce qui trompe splitVerseIntoWords() et crée des mots fantômes avec
 * normalized_word = '' et total_value = 0.
 *
 * L'algorithme réaligne également les translittérations des mots restants :
 * quand un token fantôme est à la position P, il "vole" la translittération
 * de l'API (API word P) — en supprimant ce token et en réindexant, on
 * retrouve le bon ordre (new_list[i].transliteration = original_list[i].transliteration).
 */

process.loadEnvFile(".env.local");

import { getSupabaseAdminClient } from "../lib/supabase/admin";

const supabase = getSupabaseAdminClient();

type WordRow = {
  id: string;
  position: number;
  word_text: string;
  normalized_word: string;
  total_value: number;
  transliteration: string | null;
};

type VerseRef = {
  verse_id: string;
  verse_key: string;
};

async function findAffectedVerses(): Promise<VerseRef[]> {
  let from = 0;
  const PAGE = 1000;
  const affected: VerseRef[] = [];
  const seenVerseIds = new Set<string>();

  for (;;) {
    const { data, error } = await supabase
      .from("verse_words")
      .select("verse_id, verse_key")
      .eq("normalized_word", "")
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      if (!seenVerseIds.has(row.verse_id)) {
        seenVerseIds.add(row.verse_id);
        affected.push({ verse_id: row.verse_id, verse_key: row.verse_key });
      }
    }

    if (data.length < PAGE) break;
    from += PAGE;
  }

  return affected;
}

async function loadWordsForVerse(verseId: string): Promise<WordRow[]> {
  const { data, error } = await supabase
    .from("verse_words")
    .select("id, position, word_text, normalized_word, total_value, transliteration")
    .eq("verse_id", verseId)
    .order("position");

  if (error) throw error;
  return (data ?? []) as WordRow[];
}

async function cleanVerse(verse: VerseRef): Promise<{ removed: number }> {
  const allWords = await loadWordsForVerse(verse.verse_id);

  const annotationIds = allWords
    .filter((w) => w.normalized_word === "")
    .map((w) => w.id);

  if (annotationIds.length === 0) return { removed: 0 };

  // 1. Supprimer les word_letters associés aux tokens fantômes
  const { error: lettersError } = await supabase
    .from("word_letters")
    .delete()
    .in("word_id", annotationIds);
  if (lettersError) throw lettersError;

  // 2. Supprimer les tokens fantômes de verse_words
  const { error: wordsError } = await supabase
    .from("verse_words")
    .delete()
    .in("id", annotationIds);
  if (wordsError) throw wordsError;

  // 3. Réaligner positions et translittérations pour les mots restants.
  //    Algorithme : new_list[i].transliteration = allWords[i].transliteration
  //    (la i-ème entrée de la liste ORIGINALE — incluant les tokens fantômes —
  //    portait la translittération que le i-ème mot RÉEL aurait dû avoir).
  const realWords = allWords.filter((w) => w.normalized_word !== "");

  for (let i = 0; i < realWords.length; i++) {
    const word = realWords[i];
    const correctTransliteration = allWords[i]?.transliteration ?? null;

    if (word.position !== i || word.transliteration !== correctTransliteration) {
      const { error } = await supabase
        .from("verse_words")
        .update({ position: i, transliteration: correctTransliteration })
        .eq("id", word.id);
      if (error) throw error;
    }
  }

  return { removed: annotationIds.length };
}

async function main() {
  console.log("Recherche des versets contenant des tokens de signes de lecture...");
  const affected = await findAffectedVerses();
  console.log(`→ ${affected.length} verset(s) affecté(s).`);

  if (affected.length === 0) {
    console.log("Base déjà propre, rien à faire.");
    return;
  }

  let totalRemoved = 0;
  let processed = 0;

  for (const verse of affected) {
    const { removed } = await cleanVerse(verse);
    totalRemoved += removed;
    processed++;
    if (removed > 0) {
      process.stdout.write(`  [${processed}/${affected.length}] ${verse.verse_key} — ${removed} token(s) supprimé(s)\n`);
    }
  }

  console.log(`\nTerminé : ${totalRemoved} token(s) fantôme(s) supprimé(s) sur ${affected.length} verset(s).`);
  console.log("Translittérations réalignées sur les mots restants.");
}

main().catch((err) => {
  console.error("Erreur :", err);
  process.exit(1);
});
