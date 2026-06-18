import { BottomNav } from "@/components/layout/bottom-nav";
import { SearchClient } from "@/components/search/search-client";
import { getSavedSearches } from "@/lib/supabase/saved-searches";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string }>;
}) {
  const { n } = await searchParams;
  const savedSearches = await getSavedSearches();

  return (
    <div className="bg-background flex flex-col min-h-screen bg-dot-pattern">
      <div className="px-5 pt-10 pb-4">
        <h1 className="text-xl font-headings font-semibold text-foreground">
          Recherche numérique
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Trouvez un verset, un mot ou une sourate par sa valeur
        </p>
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col gap-4">
        <SearchClient initialValue={n ?? ""} initialSavedSearches={savedSearches} />
      </div>

      <BottomNav />
    </div>
  );
}
