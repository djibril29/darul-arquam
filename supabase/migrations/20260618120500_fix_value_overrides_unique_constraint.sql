-- Bug découvert en Phase 7 : unique(user_id, target_type, verse_id, surah_id,
-- word_id) ne protège jamais rien en pratique, car chaque ligne n'a qu'une
-- seule des trois colonnes FK non nulle (les deux autres sont NULL), et
-- Postgres traite NULL <> NULL dans les contraintes unique (vérifié
-- empiriquement : deux lignes (1, null, null) sont acceptées malgré
-- unique(a,b,c)). On remplace par un index unique partiel par target_type,
-- qui ne porte que sur la colonne FK réellement pertinente pour ce type.

alter table user_value_overrides drop constraint user_value_overrides_user_id_target_type_verse_id_surah_id__key;

create unique index uq_value_overrides_word
  on user_value_overrides(user_id, word_id) where target_type = 'word';
create unique index uq_value_overrides_verse
  on user_value_overrides(user_id, verse_id) where target_type = 'verse';
create unique index uq_value_overrides_surah
  on user_value_overrides(user_id, surah_id) where target_type = 'surah';
