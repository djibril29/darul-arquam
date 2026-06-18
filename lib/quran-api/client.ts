import { createServerClient, type ServerClient } from "@quranjs/api/server";

type QfEnvironment = "prelive" | "production";

function getEnvironment(): QfEnvironment {
  return process.env.QF_ENVIRONMENT === "production" ? "production" : "prelive";
}

function getCredentials() {
  const env = getEnvironment();
  const suffix = env.toUpperCase();
  const clientId = process.env[`QF_CLIENT_ID_${suffix}`];
  const clientSecret = process.env[`QF_CLIENT_SECRET_${suffix}`];
  const oauth2BaseUrl = process.env[`QF_OAUTH2_BASE_URL_${suffix}`];
  const contentBaseUrl = process.env[`QF_CONTENT_BASE_URL_${suffix}`];

  if (!clientId || !clientSecret || !oauth2BaseUrl || !contentBaseUrl) {
    throw new Error(
      `Variables d'environnement Quran Foundation manquantes pour l'environnement "${env}" ` +
        `(QF_CLIENT_ID_${suffix}, QF_CLIENT_SECRET_${suffix}, QF_OAUTH2_BASE_URL_${suffix}, QF_CONTENT_BASE_URL_${suffix}).`
    );
  }

  return { env, clientId, clientSecret, oauth2BaseUrl, contentBaseUrl };
}

let cachedClient: ServerClient | null = null;
let cachedEnv: QfEnvironment | null = null;

/**
 * Client SDK Quran Foundation, mémoïsé. Ne jamais importer ce module côté
 * client (clientSecret). Bascule prelive/production selon QF_ENVIRONMENT —
 * ne jamais mélanger les credentials des deux environnements (PRD §12).
 */
export function getQuranClient(): ServerClient {
  const { env, clientId, clientSecret, oauth2BaseUrl, contentBaseUrl } = getCredentials();

  if (cachedClient && cachedEnv === env) return cachedClient;

  cachedClient = createServerClient({
    clientId,
    clientSecret,
    services: { oauth2BaseUrl, contentBaseUrl },
  });
  cachedEnv = env;
  return cachedClient;
}
