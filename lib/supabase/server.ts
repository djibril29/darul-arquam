import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Client Supabase pour Server Components / Server Actions / Route Handlers.
 * Utilise la clé anon + la session de l'utilisateur (cookies) — soumis à
 * RLS, contrairement au client admin de /lib/supabase/admin.ts réservé aux
 * scripts.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : les cookies sont en
            // lecture seule, le middleware se charge du rafraîchissement.
          }
        },
      },
    }
  );
}
