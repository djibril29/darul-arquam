/**
 * Lecture centralisée et vérifiée des variables d'environnement publiques.
 *
 * Les `!` (non-null assertion) utilisés auparavant mentaient au compilateur :
 * le build passait au vert et l'app renvoyait 500 sur toutes les routes dès la
 * première requête, avec un message qui ne nommait même pas la variable
 * manquante (constaté lors de la migration Vercel du 2026-09-07). On échoue
 * désormais avec un message explicite — et le build lui-même refuse de passer,
 * voir la vérification en tête de `next.config.ts`.
 */

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. ` +
        `Ajoute-la dans .env.local en local, ou via \`vercel env add ${name}\` sur ` +
        `Vercel — puis redéploie : les variables NEXT_PUBLIC_* sont injectées au ` +
        `build, les ajouter ne suffit pas à réparer un déploiement existant.`
    );
  }
  return value;
}

/**
 * Les accès à `process.env.X` doivent rester écrits littéralement : c'est ainsi
 * que Next remplace les NEXT_PUBLIC_* par leur valeur dans le bundle client.
 * Un accès dynamique (`process.env[name]`) ne serait pas substitué.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: requireEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  };
}

/**
 * URL publique du site, utilisée pour les métadonnées et pour construire les
 * liens de retour envoyés à Supabase (confirmation d'email, callback OAuth).
 * Non requise : on retombe sur l'URL du déploiement Vercel, puis sur localhost.
 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
