import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./server";

export type OverrideValue = {
  manualValue: number;
  computedValue: number;
  comment: string | null;
};

export type SurahOverridesData = {
  surahOverride: OverrideValue | null;
  /** clé = verse_key */
  verseOverrides: Record<string, OverrideValue>;
  /** clé = verse_key, puis position du mot */
  wordOverrides: Record<string, Record<number, OverrideValue>>;
};

function toOverrideValue(row: { manual_value: number; computed_value: number; comment: string | null }): OverrideValue {
  return { manualValue: row.manual_value, computedValue: row.computed_value, comment: row.comment };
}

async function getCurrentUserId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");
  return user.id;
}

/** Nombre total d'overrides (mot/verset/sourate) de l'utilisateur — pour les stats profil. */
export async function getUserOverrideCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("user_value_overrides")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

type VerseOverrideRow = {
  manual_value: number;
  computed_value: number;
  comment: string | null;
  verses: { verse_key: string };
};
type WordOverrideRow = {
  manual_value: number;
  computed_value: number;
  comment: string | null;
  verse_words: { position: number; verses: { verse_key: string } };
};

/**
 * Tous les overrides (mot/verset/sourate) pour une sourate donnée, pour
 * calculer la cascade personnelle. Utilisé par la page sourate ET par la
 * page verset (qui n'a besoin que de sa propre tranche du résultat).
 *
 * Filtre via les relations embarquées (`verses.surah_id` / `verse_words.verses.surah_id`)
 * plutôt que par listes de `verse_id`/`word_id` en `.in(...)` : pour une longue
 * sourate (ex. sourate 26, 227 versets ≈ 1800+ mots), la liste de `word_id`
 * dépasse la longueur d'URL acceptée par l'API et renvoie une erreur "Bad
 * Request" (constaté le 2026-06-27 — jamais révélé par les 8 sourates du MVP,
 * toutes ≤ 8 versets). Filtrer par un seul `surah_id` évite ce problème par
 * construction, quelle que soit la taille de la sourate.
 */
export async function getOverridesForSurah(surahNumber: number): Promise<SurahOverridesData> {
  const supabase = await createSupabaseServerClient();

  const { data: surahRow, error: surahError } = await supabase
    .from("surahs")
    .select("id")
    .eq("number", surahNumber)
    .single();
  if (surahError) throw surahError;

  const [surahOverrideResult, verseOverrideResult, wordOverrideResult] = await Promise.all([
    supabase
      .from("user_value_overrides")
      .select("manual_value, computed_value, comment")
      .eq("target_type", "surah")
      .eq("surah_id", surahRow.id)
      .maybeSingle(),
    supabase
      .from("user_value_overrides")
      .select("manual_value, computed_value, comment, verses!inner(verse_key)")
      .eq("target_type", "verse")
      .eq("verses.surah_id", surahRow.id),
    supabase
      .from("user_value_overrides")
      .select("manual_value, computed_value, comment, verse_words!inner(position, verses!inner(verse_key))")
      .eq("target_type", "word")
      .eq("verse_words.verses.surah_id", surahRow.id),
  ]);
  if (surahOverrideResult.error) throw surahOverrideResult.error;
  if (verseOverrideResult.error) throw verseOverrideResult.error;
  if (wordOverrideResult.error) throw wordOverrideResult.error;

  const verseOverrides: Record<string, OverrideValue> = {};
  for (const row of (verseOverrideResult.data ?? []) as unknown as VerseOverrideRow[]) {
    verseOverrides[row.verses.verse_key] = toOverrideValue(row);
  }

  const wordOverrides: Record<string, Record<number, OverrideValue>> = {};
  for (const row of (wordOverrideResult.data ?? []) as unknown as WordOverrideRow[]) {
    const verseKey = row.verse_words.verses.verse_key;
    wordOverrides[verseKey] ??= {};
    wordOverrides[verseKey][row.verse_words.position] = toOverrideValue(row);
  }

  return {
    surahOverride: surahOverrideResult.data ? toOverrideValue(surahOverrideResult.data) : null,
    verseOverrides,
    wordOverrides,
  };
}

async function upsertOverride(
  supabase: SupabaseClient,
  match: { target_type: string; word_id?: string; verse_id?: string; surah_id?: string },
  values: { computed_value: number; manual_value: number; comment: string | null }
): Promise<void> {
  const userId = await getCurrentUserId(supabase);

  let query = supabase
    .from("user_value_overrides")
    .select("id")
    .eq("user_id", userId)
    .eq("target_type", match.target_type);
  if (match.word_id) query = query.eq("word_id", match.word_id);
  if (match.verse_id) query = query.eq("verse_id", match.verse_id);
  if (match.surah_id) query = query.eq("surah_id", match.surah_id);

  const { data: existing, error: selectError } = await query.maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase
      .from("user_value_overrides")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("user_value_overrides").insert({
    user_id: userId,
    target_type: match.target_type,
    word_id: match.word_id ?? null,
    verse_id: match.verse_id ?? null,
    surah_id: match.surah_id ?? null,
    ...values,
  });
  if (error) throw error;
}

async function deleteOverride(
  supabase: SupabaseClient,
  match: { target_type: string; word_id?: string; verse_id?: string; surah_id?: string }
): Promise<void> {
  const userId = await getCurrentUserId(supabase);

  let query = supabase
    .from("user_value_overrides")
    .delete()
    .eq("user_id", userId)
    .eq("target_type", match.target_type);
  if (match.word_id) query = query.eq("word_id", match.word_id);
  if (match.verse_id) query = query.eq("verse_id", match.verse_id);
  if (match.surah_id) query = query.eq("surah_id", match.surah_id);

  const { error } = await query;
  if (error) throw error;
}

export async function setWordOverride(
  verseKey: string,
  position: number,
  manualValue: number,
  comment?: string | null
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: verseRow, error: verseError } = await supabase
    .from("verses")
    .select("id")
    .eq("verse_key", verseKey)
    .single();
  if (verseError) throw verseError;

  const { data: wordRow, error: wordError } = await supabase
    .from("verse_words")
    .select("id, total_value")
    .eq("verse_id", verseRow.id)
    .eq("position", position)
    .single();
  if (wordError) throw wordError;

  await upsertOverride(
    supabase,
    { target_type: "word", word_id: wordRow.id },
    { computed_value: wordRow.total_value, manual_value: manualValue, comment: comment ?? null }
  );
}

export async function removeWordOverride(verseKey: string, position: number): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: verseRow, error: verseError } = await supabase
    .from("verses")
    .select("id")
    .eq("verse_key", verseKey)
    .single();
  if (verseError) throw verseError;

  const { data: wordRow, error: wordError } = await supabase
    .from("verse_words")
    .select("id")
    .eq("verse_id", verseRow.id)
    .eq("position", position)
    .single();
  if (wordError) throw wordError;

  await deleteOverride(supabase, { target_type: "word", word_id: wordRow.id });
}

export async function setVerseOverride(
  verseKey: string,
  manualValue: number,
  comment?: string | null
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: verseRow, error: verseError } = await supabase
    .from("verses")
    .select("id, total_value")
    .eq("verse_key", verseKey)
    .single();
  if (verseError) throw verseError;

  await upsertOverride(
    supabase,
    { target_type: "verse", verse_id: verseRow.id },
    { computed_value: verseRow.total_value, manual_value: manualValue, comment: comment ?? null }
  );
}

export async function removeVerseOverride(verseKey: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: verseRow, error: verseError } = await supabase
    .from("verses")
    .select("id")
    .eq("verse_key", verseKey)
    .single();
  if (verseError) throw verseError;

  await deleteOverride(supabase, { target_type: "verse", verse_id: verseRow.id });
}

export async function setSurahOverride(
  surahNumber: number,
  manualValue: number,
  comment?: string | null
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: surahRow, error: surahError } = await supabase
    .from("surahs")
    .select("id, total_value_with_basmala, total_value_without_basmala")
    .eq("number", surahNumber)
    .single();
  if (surahError) throw surahError;

  const computedValue = surahRow.total_value_without_basmala ?? surahRow.total_value_with_basmala ?? 0;

  await upsertOverride(
    supabase,
    { target_type: "surah", surah_id: surahRow.id },
    { computed_value: computedValue, manual_value: manualValue, comment: comment ?? null }
  );
}

export async function removeSurahOverride(surahNumber: number): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: surahRow, error: surahError } = await supabase
    .from("surahs")
    .select("id")
    .eq("number", surahNumber)
    .single();
  if (surahError) throw surahError;

  await deleteOverride(supabase, { target_type: "surah", surah_id: surahRow.id });
}
