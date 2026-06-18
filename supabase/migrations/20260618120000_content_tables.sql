-- Tables de contenu coranique (PRD §11). Remplies uniquement par les scripts
-- d'import côté serveur (service_role) — jamais en écriture depuis le frontend.

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

create index idx_verses_total_value on verses(total_value);
create index idx_verses_surah_id on verses(surah_id);
create index idx_words_total_value on verse_words(total_value);
create index idx_verse_words_verse_id on verse_words(verse_id);
create index idx_word_letters_word_id on word_letters(word_id);
create index idx_surahs_total_with_basmala on surahs(total_value_with_basmala);
create index idx_surahs_total_without_basmala on surahs(total_value_without_basmala);
