-- L'app affiche le nom français de la sourate (ex. "L'Ouverture") et le lieu
-- de révélation, qui ne faisaient pas partie du schéma initial (PRD §11
-- n'avait que name_arabic/name_latin/name_english). Résolus de façon fiable
-- via l'API Quran Foundation (chapters.findById avec language explicite),
-- jamais inventés.

alter table surahs add column name_translated text;
alter table surahs add column revelation_place text;
