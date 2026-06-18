import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour Client Components. Réservé aux interactions qui
 * doivent s'exécuter dans le navigateur (ex. redirection OAuth) — le reste
 * de l'app passe par des Server Actions (/lib/supabase/server.ts).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
