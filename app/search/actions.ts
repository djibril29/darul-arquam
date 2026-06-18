"use server";

import { revalidatePath } from "next/cache";
import { searchByNumber, type SearchResults } from "@/lib/supabase/queries";
import {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
  type SavedSearch,
} from "@/lib/supabase/saved-searches";

export async function searchByNumberAction(value: number): Promise<SearchResults> {
  return searchByNumber(value);
}

export async function saveSearchAction(value: number): Promise<SavedSearch[]> {
  await createSavedSearch(value);
  revalidatePath("/search");
  return getSavedSearches();
}

export async function deleteSavedSearchAction(id: string): Promise<SavedSearch[]> {
  await deleteSavedSearch(id);
  revalidatePath("/search");
  return getSavedSearches();
}
