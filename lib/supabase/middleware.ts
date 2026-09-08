import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

const AUTH_PUBLIC_PATHS = ["/login", "/register", "/auth/callback", "/welcome"];
const ALWAYS_PUBLIC_PATHS = ["/terms"];

/**
 * Rafraîchit la session Supabase à chaque requête et protège les routes :
 * redirige vers /welcome si non authentifié (sauf pages toujours publiques
 * comme /terms), vers / si déjà authentifié sur une page d'auth (login/
 * register/welcome).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url: supabaseUrl, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPublic = AUTH_PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAlwaysPublic = ALWAYS_PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isAuthPublic && !isAlwaysPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
