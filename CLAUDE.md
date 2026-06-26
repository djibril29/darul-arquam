# CLAUDE.md — Darul Arqam

Ce fichier oriente Claude Code (et tout contributeur) sur les règles non négociables du projet. La source de vérité fonctionnelle complète est [`darul-arqam-prd.md`](./darul-arqam-prd.md). Le plan d'implémentation phase par phase est dans `.claude/plans/elegant-whistling-finch.md` (ou `/Users/user/.claude/plans/elegant-whistling-finch.md`).

## Résumé du produit

Darul Arqam est une application web privée de lecture et d'analyse numérique du Coran, basée sur un système de guématrie arabe **unique et personnalisé** (pas de sélection entre plusieurs systèmes). MVP initial : 8 sourates (1, 108–114). Périmètre importé réel au 2026-06-26 : **66 sourates (1, 50–114)** — sourates 80–114 importées lors d'une session antérieure (non documentée à l'époque), sourates 50–79 ajoutées le 2026-06-26. Sourates 2–49 et 9 restent non importées.

## Règles d'or — ne jamais dévier

1. **Aucun calcul n'est effectué par IA.** Toute valeur numérique (lettre, mot, verset, sourate) provient exclusivement de fonctions TypeScript déterministes dans `/lib/gematria`. Ne jamais inventer, estimer ou faire calculer une valeur par un modèle de langage.
2. **Les calculs doivent être reproductibles.** Même texte normalisé → même résultat, toujours. `recalculateValues()` doit redonner exactement les mêmes totaux que l'import initial, sans rappeler l'API externe.
3. **Calcul depuis `text_uthmani`.** Affichage et calcul partagent désormais la même source (`text_uthmani`, vocalisé), passée dans `normalizeArabicText()` (décision produit 2026-06-18 : `text_uthmani_simple` ne contient jamais les signes d'allongement coraniques, donc ne peut pas servir de source si on veut les compter — voir règle n°4). Ne rappelle jamais l'API à ce stade, le texte est déjà stocké.
4. **Normalisation (PRD §7, mise à jour 2026-06-20)** : supprime voyelles/tajwid/tatweel, ne double pas une lettre sous une shadda, **conserve `آ` (valeur 2)** distinct des autres formes d'alif (valeur 1), convertit `ٱ` → `ا`. **Convertit en lettre pleine l'alef suscrit** (`ٰ`, U+0670, voyelle longue structurelle du rasm, ex. "العالمين", "الرحمن", ou la particule vocative "يٰ" = "يا" avec alef élidé) → `ا` (1) — **sauf quand l'alef suscrit suit directement un `ى`** (alef maksura) : dans ce cas (`ىٰ`, ex. "تولّىٰ", "استغنىٰ", "الذكرىٰ" — très fréquent en sourate 80), l'alef suscrit ne fait que renforcer visuellement la voyelle déjà portée par le `ى` (lui-même valant 1) ; il est alors retiré au lieu d'être converti, pour éviter de compter deux fois la même voyelle longue (`collapseYaDaggerAlef`, décision produit 2026-06-20, vérifiée empiriquement : 121 occurrences sur 290 dans le corpus importé). **Ne convertit pas** le petit waw (`ۥ`, U+06E5) ni le petit yâ (`ۦ`, U+06E6) — restent supprimés comme des diacritiques : dans le corpus MVP, ils n'apparaissent que comme marque de silat sur un suffixe pronominal (ـهُۥ/ـهِۦ, ex. "لَّهُۥ" = lahu), une nuance de récitation contextuelle, pas une lettre du mot (vérifié par contre-exemple le 2026-06-18 : "لَّهُۥ" doit valoir 35, pas 41). Ne transforme rien d'autre, logue tout caractère inconnu au lieu de planter. `calculateBasmalaValue()` (utilisée pour la basmala virtuelle des sourates 108-114) doit rester cohérente avec le verset 1:1 réel d'Al-Fatiha — calculée depuis `BASMALA_TEXT_UTHMANI`, pas `BASMALA_TEXT_SIMPLE`.
5. **Mapping lettre→valeur (PRD §8)** est fixe et unique — ne pas le modifier sans une décision produit explicite de l'utilisateur.
6. **Basmala (PRD §9)** : verset réel pour Al-Fatiha ; basmala virtuelle (`is_basmala_virtual: true`) ajoutée en calcul pour toute sourate importée sauf la 1 (`needsVirtualBasmala`, logique par exclusion dans `lib/gematria/basmala.ts`) ; règle explicite à prévoir plus tard pour la sourate 9, qui n'a aucune basmala et reste exclue/non importée pour l'instant.
7. **Override manuel = couche personnelle, jamais un écrasement.** L'utilisateur peut saisir une valeur manuelle sur le total d'un verset, le total d'une sourate, ou la valeur d'un mot (table `user_value_overrides`, RLS par utilisateur). Cela **ne modifie jamais** `total_value`/`numeric_value` dans `verses`/`verse_words`/`surahs` — la valeur calculée reste affichée et stockée intacte, la valeur perso est affichée en complément.
8. **L'app ne doit jamais appeler l'API Quran Foundation à la lecture.** L'API ne sert qu'à l'import (scripts serveur). L'app lit uniquement Supabase.
9. **`service_role` key Supabase et `QF_CLIENT_SECRET`** : jamais exposés au frontend, utilisés uniquement dans `/scripts` côté serveur.

## Stack technique

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui, RSC par défaut
- Supabase : Postgres + Auth + RLS (`@supabase/ssr`)
  - Connexion email/password (Server Actions) **et** Google OAuth (`signInWithOAuth`, bouton client + route `/app/auth/callback`)
  - Provider Google à activer côté dashboard Supabase (Authentication → Providers) + Google Cloud Console (OAuth client ID/secret) — config externe, pas dans ce repo
- Tests : Vitest (critique pour le moteur de guématrie)
- Données coraniques : **Quran Foundation Content API** via le SDK officiel `@quranjs/api`
  - `@quranjs/api/server` côté serveur (scripts d'import, jamais côté client)
  - `@quranjs/api/public` côté client si jamais nécessaire (peu probable, l'app lit Supabase)
  - Le SDK gère OAuth2 (`client_credentials`, scope `content`), cache de token et headers `x-auth-token`/`x-client-id` automatiquement
  - Ne **pas** utiliser le starter app `@quranjs/create-app` : on a déjà notre propre architecture Next.js/Supabase/guématrie, le starter imposerait sa propre structure (reader/notes/bookmarks) en conflit avec la nôtre
- Design : MCP Banani connecté (`claude mcp add --transport http banani ...`) pour récupérer écrans/tokens de design pendant la phase UI
- Déploiement : Vercel (app) + Supabase (DB/Auth)

## Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# "production" a le contenu complet (chapitres/versets/traductions) en lecture sans scope
# additionnel ; "prelive" a des données limitées (404 constaté sur les métadonnées de sourate).
QF_ENVIRONMENT=production

QF_CLIENT_ID_PRELIVE=
QF_CLIENT_SECRET_PRELIVE=
QF_OAUTH2_BASE_URL_PRELIVE=https://prelive-oauth2.quran.foundation
QF_CONTENT_BASE_URL_PRELIVE=https://apis-prelive.quran.foundation/content

QF_CLIENT_ID_PRODUCTION=
QF_CLIENT_SECRET_PRODUCTION=
QF_OAUTH2_BASE_URL_PRODUCTION=https://oauth2.quran.foundation
QF_CONTENT_BASE_URL_PRODUCTION=https://apis.quran.foundation/content

# id=31 = Muhammad Hamidullah, résolu via client.resources.findAllTranslations()
# filtré client-side sur languageName === "french" (le paramètre language= du SDK
# n'est pas respecté par l'API côté production, vérifié empiriquement)
FRENCH_TRANSLATION_RESOURCE_ID=31
```

Ne jamais mélanger les credentials prelive et production. Les vraies valeurs vivent uniquement dans `.env.local` (gitignored), jamais dans ce fichier ni dans le code commité.

## Structure de dossiers (cible)

```
/app                      → routes (App Router)
/lib/gematria              → mapping, normalisation, calculs (pur, sans I/O) — cœur testé du produit
/lib/quran-api             → wrapper autour du SDK @quranjs/api
/lib/supabase              → clients server/browser, requêtes data-access
/lib/types                 → types partagés (WordCalculation, VerseCalculation, LetterCalculation...)
/scripts                   → importSurah, importMvpSurahs, recalculateValues
/supabase/migrations       → SQL des tables/index/RLS
/components                → UI (notes, recherche, breakdown lettre par lettre, overrides manuels)
```

## Commandes

```bash
pnpm dev              # serveur de dev Next.js
pnpm test             # tests Vitest (moteur de guématrie en priorité)
pnpm import:mvp       # importe les 8 sourates du MVP depuis l'API vers Supabase
pnpm recalculate      # recalcule les valeurs depuis les textes déjà stockés, sans rappeler l'API
```

## Périmètre du MVP

Inclus : auth Supabase, liste/page sourates, page verset, texte uthmani + simple + traduction FR, valeurs lettre/mot/verset/sourate, basmala, notes (verset/sourate), page Notes, recherche par nombre, recherches sauvegardées, **override manuel personnel** (mot/verset/sourate).

Exclu : audio, export PDF, tafsir, plusieurs systèmes de calcul, espace communautaire, partage public de notes, admin avancée, import des 114 sourates dès la V1.

**Sourates importées en base (2026-06-26) : 66 — sourate 1, puis 50 à 114 en continu.** Sourates 2–49 non importées (prochain chantier logique pour combler l'écart). Sourate 9 toujours exclue (PRD §9, règle d'or n°6, aucune basmala). Si tu importes de nouvelles sourates, vérifie d'abord l'état réel de la table `surahs` plutôt que de te fier uniquement à cette liste, qui peut devenir obsolète.
