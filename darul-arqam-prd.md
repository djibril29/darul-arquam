# PRD — Darul Arqam

## 1. Résumé du produit

**Nom du projet :** Darul Arqam  
**Type :** Application web privée de lecture et d’analyse numérique du Coran  
**Positionnement :** Darul Arqam est une application de lecture et d’analyse numérique du Coran basée sur la guématrie arabe. Elle permet d’explorer les valeurs numériques des lettres, des mots, des versets et des sourates selon un système de correspondance personnalisé.

L’application doit afficher le texte coranique en écriture uthmani vocalisée pour la lecture, mais utiliser un texte simple sans voyelles ni symboles pour les calculs.

---

## 2. Objectif du MVP

Le MVP doit permettre de tester la logique complète sur un petit corpus avant d’importer tout le Coran.

### Sourates incluses dans le MVP

Le MVP inclut :

- Sourate 1 — Al-Fatiha
- Sourate 108 — Al-Kawthar
- Sourate 109 — Al-Kafirun
- Sourate 110 — An-Nasr
- Sourate 111 — Al-Masad
- Sourate 112 — Al-Ikhlas
- Sourate 113 — Al-Falaq
- Sourate 114 — An-Nas

> Note : de Al-Kawthar à An-Nas, il y a 7 sourates. Avec Al-Fatiha, le MVP contient donc 8 sourates.

---

## 3. Objectifs fonctionnels

### Fonctionnalités incluses dans le MVP

1. Authentification utilisateur avec Supabase Auth.
2. Affichage de la liste des sourates importées.
3. Affichage d’une page de sourate.
4. Affichage des versets d’une sourate.
5. Affichage du texte arabe uthmani vocalisé.
6. Affichage du texte simple utilisé pour le calcul.
7. Affichage de la traduction française du verset.
8. Calcul de la valeur numérique de chaque lettre.
9. Calcul de la valeur numérique de chaque mot.
10. Calcul du total de chaque verset.
11. Calcul du total de chaque sourate.
12. Inclusion de la basmala au début des sourates selon la règle définie.
13. Possibilité de créer, modifier et supprimer une note personnelle sur un verset.
14. Possibilité de créer, modifier et supprimer une note personnelle sur une sourate.
15. Page “Notes” pour retrouver toutes les notes sauvegardées.
16. Recherche par nombre : afficher les versets, mots ou sourates ayant une valeur donnée.
17. Sauvegarde des recherches numériques importantes.

### Fonctionnalités exclues du MVP

- Audio/récitation.
- Export PDF.
- Tafsir.
- Plusieurs systèmes de calcul.
- Espace communautaire.
- Partage public de notes.
- Interface d’administration avancée.
- Import complet des 114 sourates dès la V1.

---

## 4. Stack technique recommandé

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- React Server Components lorsque pertinent

### Backend

- Next.js Server Actions et/ou API Routes
- Scripts Node.js/TypeScript pour l’import et le recalcul

### Base de données

- Supabase PostgreSQL
- Supabase Auth
- Row Level Security pour les notes et recherches sauvegardées

### Déploiement

- Vercel pour l’application Next.js
- Supabase pour la base de données et l’authentification

---

## 5. Source des données coraniques

### Source principale

Utiliser Quran Foundation / Quran.com API comme source principale pour récupérer :

- les sourates ;
- les versets ;
- le texte uthmani vocalisé ;
- le texte uthmani simple ;
- les mots ;
- les traductions françaises via un resource ID de traduction.

### Données nécessaires pour chaque verset

Pour chaque verset, stocker au minimum :

- `chapter_id`
- `verse_number`
- `verse_key`, exemple : `1:1`
- `text_uthmani`
- `text_uthmani_simple`
- `normalized_text`
- `french_translation`
- `total_value`

### Exemple d’appel API pour une sourate

```ts
const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?fields=text_uthmani,text_uthmani_simple&words=true&word_fields=text_uthmani,text_uthmani_simple&translations=${FRENCH_TRANSLATION_RESOURCE_ID}&per_page=50`;
```

### Liste des sourates à importer dans le MVP

```ts
export const MVP_SURAHS = [1, 108, 109, 110, 111, 112, 113, 114];
```

### Import complet futur

Plus tard, pour importer tout le Coran :

```ts
export const ALL_SURAHS = Array.from({ length: 114 }, (_, index) => index + 1);
```

Le même script doit pouvoir importer soit le MVP, soit l’ensemble du Coran selon une variable de configuration.

---

## 6. Architecture générale des données

Flux recommandé :

```txt
Quran API → script d’import → moteur de calcul → Supabase → application Next.js
```

L’application ne doit pas appeler l’API Quran Foundation à chaque lecture. L’API sert à importer les données. Une fois importées, les données doivent être lues depuis Supabase.

### Pourquoi pré-calculer ?

Le pré-calcul permet :

- une lecture rapide ;
- une recherche par nombre efficace ;
- une cohérence des résultats ;
- une indépendance vis-à-vis de l’API externe au moment de l’utilisation ;
- une meilleure stabilité pour les notes et les recherches sauvegardées.

---

## 7. Règles de texte et de normalisation

### Texte affiché

Le texte affiché à l’utilisateur doit être le texte uthmani vocalisé :

```txt
text_uthmani
```

Exemple :

```txt
بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
```

### Texte de calcul

Le texte utilisé comme base de calcul doit être :

```txt
text_uthmani_simple
```

Puis il doit passer dans une fonction de normalisation interne.

Exemple :

```txt
بسم الله الرحمن الرحيم
```

### Règles de normalisation

1. Supprimer les voyelles arabes.
2. Supprimer les signes de tajwid et symboles coraniques.
3. Supprimer la shadda sans doubler la lettre.
4. Supprimer les signes graphiques de prolongation comme le tatweel `ـ`.
5. Ne pas ajouter de lettres invisibles ou prosodiques.
6. Conserver uniquement les lettres écrites nécessaires au calcul.
7. Ne pas transformer `آ` en `ا`, car `آ` vaut 2 dans ce système.
8. Convertir `ٱ` vers `ا`, sauf décision contraire future.
9. Détecter et logger les caractères inconnus.

---

## 8. Système de guématrie utilisé

Le système utilisé par Darul Arqam est un système unique et personnalisé. Il n’y a pas de sélection entre plusieurs systèmes dans le MVP.

### Correspondance lettres → valeurs

| Lettre | Valeur |
|---|---:|
| ا | 1 |
| أ | 1 |
| إ | 1 |
| ٱ | 1 |
| ء | 1 |
| ؤ | 1 |
| ئ | 1 |
| ى | 1 |
| آ | 2 |
| ب | 2 |
| ج | 3 |
| د | 4 |
| ه | 5 |
| و | 6 |
| ز | 7 |
| ح | 8 |
| ط | 9 |
| ي | 10 |
| ك | 20 |
| ل | 30 |
| م | 40 |
| ن | 50 |
| ص | 60 |
| ع | 70 |
| ف | 80 |
| ض | 90 |
| ق | 100 |
| ر | 200 |
| س | 300 |
| ت | 400 |
| ة | 400 |
| ث | 500 |
| خ | 600 |
| ذ | 700 |
| ظ | 800 |
| غ | 900 |
| ش | 1000 |

### Règles particulières

- `آ` vaut 2, car il représente une forme d’alif avec allongement.
- Les formes simples d’alif valent 1.
- `ة` vaut 400.
- `ى` vaut 1.
- La shadda ne double pas la lettre.
- Les voyelles ne sont pas calculées.
- Les symboles coraniques ne sont pas calculés.
- Le calcul se fait uniquement sur les lettres écrites après normalisation.

---

## 9. Règle de la basmala

La basmala doit être incluse au début de chaque sourate dans les calculs du MVP, selon le choix produit.

### Cas particuliers

- Sourate 1 — Al-Fatiha : la basmala est déjà le verset 1.
- Sourates 108 à 114 : ajouter une basmala de calcul au début de la sourate si elle n’est pas présente comme verset numéroté.
- Sourate 9 — At-Tawbah : hors MVP, mais prévoir une règle explicite pour une version future.

### Recommandation technique

Ajouter un champ permettant de distinguer une basmala réelle d’une basmala ajoutée pour le calcul.

```sql
is_basmala_virtual boolean default false
```

---

## 10. Fonctions techniques à créer

### `normalizeArabicText(text: string): string`

Rôle : préparer le texte pour le calcul.

Responsabilités :

- supprimer voyelles et symboles ;
- supprimer la shadda sans doubler la lettre ;
- supprimer le tatweel ;
- conserver `آ` ;
- convertir `ٱ` en `ا` ;
- retourner le texte final à calculer.

### `splitVerseIntoWords(text: string): string[]`

Rôle : découper un verset normalisé en mots.

### `splitWordIntoLetters(word: string): string[]`

Rôle : découper un mot arabe en lettres.

Utiliser `Array.from(word)` pour mieux gérer les caractères Unicode.

### `getLetterValue(letter: string): number`

Rôle : retourner la valeur numérique d’une lettre.

Si la lettre n’existe pas dans le mapping, retourner `0` et l’ajouter dans un log des caractères inconnus.

### `calculateWordValue(word: string): WordCalculation`

Rôle : calculer la valeur d’un mot.

Retour attendu :

```ts
type WordCalculation = {
  word: string;
  normalizedWord: string;
  letters: LetterCalculation[];
  total: number;
};
```

### `calculateVerseValue(verseText: string): VerseCalculation`

Rôle : calculer la valeur totale d’un verset.

Retour attendu :

```ts
type VerseCalculation = {
  originalText: string;
  normalizedText: string;
  words: WordCalculation[];
  total: number;
  unknownCharacters: string[];
};
```

### `calculateSurahTotal(verses: VerseCalculation[], includeBasmala: boolean): number`

Rôle : calculer le total d’une sourate.

### `detectUnknownCharacters(text: string): string[]`

Rôle : détecter les caractères présents dans le texte normalisé mais absents du mapping.

### `importSurah(surahNumber: number): Promise<void>`

Rôle : récupérer une sourate depuis l’API, calculer ses valeurs et insérer/upsert les données dans Supabase.

### `importMvpSurahs(): Promise<void>`

Rôle : importer uniquement les sourates du MVP.

### `recalculateValues(): Promise<void>`

Rôle : recalculer les valeurs à partir des textes déjà stockés dans Supabase sans rappeler l’API.

### `searchByNumber(value: number): Promise<SearchResults>`

Rôle : chercher les mots, versets et sourates ayant une valeur totale donnée.

---

## 11. Schéma Supabase recommandé

### Table `surahs`

```sql
create table surahs (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique,
  name_arabic text,
  name_latin text,
  name_english text,
  verses_count integer,
  total_value_with_basmala integer default 0,
  total_value_without_basmala integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Table `verses`

```sql
create table verses (
  id uuid primary key default gen_random_uuid(),
  surah_id uuid references surahs(id) on delete cascade,
  surah_number integer not null,
  verse_number integer not null,
  verse_key text not null unique,
  text_uthmani text not null,
  text_uthmani_simple text not null,
  normalized_text text not null,
  french_translation text,
  total_value integer not null default 0,
  is_basmala_virtual boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Table `verse_words`

```sql
create table verse_words (
  id uuid primary key default gen_random_uuid(),
  verse_id uuid references verses(id) on delete cascade,
  verse_key text not null,
  position integer not null,
  word_text text not null,
  normalized_word text not null,
  total_value integer not null default 0,
  created_at timestamptz default now(),
  unique(verse_id, position)
);
```

### Table `word_letters`

```sql
create table word_letters (
  id uuid primary key default gen_random_uuid(),
  word_id uuid references verse_words(id) on delete cascade,
  verse_key text not null,
  word_position integer not null,
  letter_position integer not null,
  letter text not null,
  normalized_letter text not null,
  numeric_value integer not null default 0,
  created_at timestamptz default now(),
  unique(word_id, letter_position)
);
```

### Table `user_notes`

```sql
create table user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  surah_id uuid references surahs(id) on delete cascade,
  verse_id uuid references verses(id) on delete cascade,
  note_type text not null check (note_type in ('verse', 'surah', 'general')),
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Table `saved_searches`

```sql
create table saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  search_number integer not null,
  title text,
  created_at timestamptz default now()
);
```

### Index recommandés

```sql
create index idx_verses_total_value on verses(total_value);
create index idx_words_total_value on verse_words(total_value);
create index idx_surahs_total_with_basmala on surahs(total_value_with_basmala);
create index idx_surahs_total_without_basmala on surahs(total_value_without_basmala);
create index idx_notes_user_id on user_notes(user_id);
create index idx_notes_verse_id on user_notes(verse_id);
create index idx_saved_searches_user_id on saved_searches(user_id);
```

---

## 12. RLS et sécurité

### Données publiques internes

Les tables suivantes peuvent être lisibles par les utilisateurs authentifiés :

- `surahs`
- `verses`
- `verse_words`
- `word_letters`

Elles ne doivent pas être modifiables depuis le frontend.

### Données privées

Les tables suivantes doivent être protégées par RLS :

- `user_notes`
- `saved_searches`

Un utilisateur ne doit pouvoir lire, créer, modifier ou supprimer que ses propres notes et recherches.

### Import

L’import doit utiliser une clé serveur sécurisée, jamais exposée au frontend.

Variables d’environnement recommandées :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
QURAN_API_BASE_URL=https://api.quran.com/api/v4
FRENCH_TRANSLATION_RESOURCE_ID=
```

---

## 13. Pages du MVP

### `/login`

- Connexion utilisateur.
- Création de compte si nécessaire.

### `/`

- Dashboard simple.
- Accès rapide aux sourates MVP.
- Accès à la recherche par nombre.
- Accès aux notes.

### `/surahs`

- Liste des sourates importées.
- Nom arabe.
- Nom latin.
- Nombre de versets.
- Total de la sourate.

### `/surahs/[number]`

- Liste des versets de la sourate.
- Texte arabe.
- Traduction française.
- Total du verset.
- Bouton vers détails du calcul.

### `/verses/[verseKey]`

- Texte uthmani vocalisé.
- Texte simple calculé.
- Traduction française.
- Total du verset.
- Liste des mots avec valeurs.
- Détail lettre par lettre.
- Zone de note personnelle pour ce verset.

### `/search`

- Champ numérique.
- Résultats par versets.
- Résultats par mots.
- Résultats par sourates.
- Bouton pour sauvegarder la recherche.

### `/notes`

- Liste de toutes les notes.
- Filtre par sourate.
- Filtre par type : verset, sourate, général.
- Lien vers le verset ou la sourate associée.

---

## 14. Comportement attendu de l’import

### Pseudo-code

```ts
const SURAHS_TO_IMPORT = [1, 108, 109, 110, 111, 112, 113, 114];

for (const surahNumber of SURAHS_TO_IMPORT) {
  const verses = await fetchSurahFromQuranApi(surahNumber);

  await upsertSurahMetadata(surahNumber);

  for (const verse of verses) {
    const calculation = calculateVerseValue(verse.text_uthmani_simple);

    const savedVerse = await upsertVerse({
      surahNumber,
      verseNumber: verse.verse_number,
      verseKey: verse.verse_key,
      textUthmani: verse.text_uthmani,
      textUthmaniSimple: verse.text_uthmani_simple,
      normalizedText: calculation.normalizedText,
      frenchTranslation: extractFrenchTranslation(verse),
      totalValue: calculation.total,
    });

    for (const word of calculation.words) {
      const savedWord = await upsertWord(savedVerse.id, word);

      for (const letter of word.letters) {
        await upsertLetter(savedWord.id, letter);
      }
    }
  }

  await updateSurahTotals(surahNumber);
}
```

---

## 15. Critères d’acceptation du MVP

Le MVP est validé si :

1. L’utilisateur peut se connecter.
2. Les 8 sourates du MVP sont importées dans Supabase.
3. Chaque verset a un texte uthmani affichable.
4. Chaque verset a un texte simple/normalisé calculable.
5. Chaque mot a une valeur numérique.
6. Chaque lettre calculée est visible avec sa valeur.
7. Chaque verset affiche un total.
8. Chaque sourate affiche un total.
9. L’utilisateur peut chercher un nombre et trouver les versets/mots correspondants.
10. L’utilisateur peut écrire une note sur un verset.
11. L’utilisateur peut retrouver ses notes dans une page dédiée.
12. Les notes d’un utilisateur ne sont pas visibles par un autre utilisateur.
13. Aucun calcul n’est effectué par IA.
14. Les calculs sont reproductibles et déterministes.
15. Les caractères inconnus sont détectés et listés.

---

## 16. Prompt recommandé pour Claude/Cursor

Utiliser ce PRD pour générer une application Next.js + Supabase appelée Darul Arqam.

Priorité de génération :

1. Créer la structure du projet.
2. Créer les types TypeScript.
3. Créer le mapping lettres → valeurs.
4. Créer les fonctions de normalisation et de calcul.
5. Créer les migrations Supabase.
6. Créer le script d’import MVP.
7. Créer les pages principales.
8. Créer les composants UI.
9. Ajouter l’authentification.
10. Ajouter les notes et recherches sauvegardées.

Ne pas inventer un autre système de calcul. Ne pas utiliser l’IA pour calculer les valeurs. Le calcul doit être fait uniquement par fonctions TypeScript déterministes.
