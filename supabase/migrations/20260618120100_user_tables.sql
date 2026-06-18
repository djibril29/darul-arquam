-- Tables privées par utilisateur (PRD §11 + règle d'or n°7 du CLAUDE.md pour
-- user_value_overrides : couche personnelle, ne modifie jamais total_value/
-- numeric_value dans verses/verse_words/surahs).

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

create table saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  search_number integer not null,
  title text,
  created_at timestamptz default now()
);

create table user_value_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('verse', 'surah', 'word')),
  verse_id uuid references verses(id) on delete cascade,
  surah_id uuid references surahs(id) on delete cascade,
  word_id uuid references verse_words(id) on delete cascade,
  computed_value integer not null,
  manual_value integer not null,
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, target_type, verse_id, surah_id, word_id)
);

create index idx_notes_user_id on user_notes(user_id);
create index idx_notes_verse_id on user_notes(verse_id);
create index idx_saved_searches_user_id on saved_searches(user_id);
create index idx_value_overrides_user_id on user_value_overrides(user_id);
