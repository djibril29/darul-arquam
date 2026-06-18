import { createSupabaseServerClient } from "./server";

export type SavedSearch = {
  id: string;
  searchNumber: number;
  title: string | null;
  createdAt: string;
};

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, search_number, title, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    searchNumber: row.search_number,
    title: row.title,
    createdAt: row.created_at,
  }));
}

export async function createSavedSearch(searchNumber: number, title?: string | null): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { error } = await supabase
    .from("saved_searches")
    .insert({ user_id: user.id, search_number: searchNumber, title: title ?? null });
  if (error) throw error;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("saved_searches").delete().eq("id", id);
  if (error) throw error;
}
