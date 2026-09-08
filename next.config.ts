import type { NextConfig } from "next";

/**
 * Fail-fast sur les variables d'environnement critiques.
 *
 * `proxy.ts` matche quasiment toutes les routes et instancie un client Supabase
 * à chaque requête : sans ces variables, le build reste vert mais 100 % du site
 * répond 500 (migration Vercel du 2026-09-07). Mieux vaut casser le build ici,
 * avec le nom de la variable manquante, que de le découvrir en production.
 */
const REQUIRED_PUBLIC_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const missing = REQUIRED_PUBLIC_ENV.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(
    `Variables d'environnement manquantes : ${missing.join(", ")}.\n` +
      `En local : renseigne-les dans .env.local.\n` +
      `Sur Vercel : \`vercel env add <NOM>\` puis redéploie — ces variables sont ` +
      `injectées au build, les ajouter ne répare pas un déploiement déjà construit.`
  );
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
