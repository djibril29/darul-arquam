"use client";

import { useState, useSyncExternalStore } from "react";

const DISMISSED_KEY = "darul-arqam:install-prompt-dismissed";

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isStandaloneDisplay() {
  const legacyIosStandalone = (navigator as { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || legacyIosStandalone === true;
}

function subscribe() {
  return () => {};
}

function getShouldShowSnapshot() {
  if (typeof window === "undefined") return false;
  if (!isIosDevice() || isStandaloneDisplay()) return false;
  return localStorage.getItem(DISMISSED_KEY) !== "1";
}

function getServerSnapshot() {
  return false;
}

/**
 * Safari iOS n'a pas d'événement `beforeinstallprompt` : on guide nous-mêmes
 * l'utilisateur vers Partager → « Sur l'écran d'accueil ». `useSyncExternalStore`
 * lit cet état navigateur sans déclencher de setState dans un effet (évite le
 * rendu en cascade et reste cohérent avec le rendu serveur, toujours masqué).
 */
export function InstallPrompt() {
  const shouldShow = useSyncExternalStore(subscribe, getShouldShowSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  if (!shouldShow || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-xl border border-gold-soft bg-card px-4 py-3 text-sm text-foreground shadow-lg"
    >
      <p>
        Pour installer Darul Arqam sur votre écran d&apos;accueil : appuyez sur partager (⎋) puis « Sur
        l&apos;écran d&apos;accueil ».
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(DISMISSED_KEY, "1");
          setDismissed(true);
        }}
        className="shrink-0 text-xs font-medium text-primary"
      >
        Fermer
      </button>
    </div>
  );
}
