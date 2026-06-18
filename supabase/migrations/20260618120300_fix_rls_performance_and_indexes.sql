-- Corrections suite aux advisors Supabase post-migration :
-- 1) auth.uid() dans les policies RLS doit être wrappé en (select auth.uid())
--    sinon il est ré-évalué à chaque ligne au lieu d'une fois par requête.
-- 2) Index manquants sur des colonnes de clé étrangère utilisées par l'app
--    (filtrer les notes par sourate, les overrides par sourate/verset/mot).

alter policy "Users can view their own notes" on user_notes
  using ((select auth.uid()) = user_id);
alter policy "Users can insert their own notes" on user_notes
  with check ((select auth.uid()) = user_id);
alter policy "Users can update their own notes" on user_notes
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "Users can delete their own notes" on user_notes
  using ((select auth.uid()) = user_id);

alter policy "Users can view their own saved searches" on saved_searches
  using ((select auth.uid()) = user_id);
alter policy "Users can insert their own saved searches" on saved_searches
  with check ((select auth.uid()) = user_id);
alter policy "Users can update their own saved searches" on saved_searches
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "Users can delete their own saved searches" on saved_searches
  using ((select auth.uid()) = user_id);

alter policy "Users can view their own value overrides" on user_value_overrides
  using ((select auth.uid()) = user_id);
alter policy "Users can insert their own value overrides" on user_value_overrides
  with check ((select auth.uid()) = user_id);
alter policy "Users can update their own value overrides" on user_value_overrides
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "Users can delete their own value overrides" on user_value_overrides
  using ((select auth.uid()) = user_id);

create index idx_user_notes_surah_id on user_notes(surah_id);
create index idx_value_overrides_surah_id on user_value_overrides(surah_id);
create index idx_value_overrides_verse_id on user_value_overrides(verse_id);
create index idx_value_overrides_word_id on user_value_overrides(word_id);
