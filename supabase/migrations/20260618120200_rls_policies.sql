-- RLS (PRD §12). Les tables de contenu sont lisibles par les utilisateurs
-- authentifiés et jamais modifiables depuis le frontend (seule la
-- service_role, qui contourne RLS, peut écrire — utilisée uniquement dans
-- /scripts côté serveur). Les tables privées sont strictement filtrées sur
-- auth.uid() = user_id.

alter table surahs enable row level security;
alter table verses enable row level security;
alter table verse_words enable row level security;
alter table word_letters enable row level security;

create policy "Authenticated users can read surahs"
  on surahs for select to authenticated using (true);

create policy "Authenticated users can read verses"
  on verses for select to authenticated using (true);

create policy "Authenticated users can read verse_words"
  on verse_words for select to authenticated using (true);

create policy "Authenticated users can read word_letters"
  on word_letters for select to authenticated using (true);

-- user_notes
alter table user_notes enable row level security;

create policy "Users can view their own notes"
  on user_notes for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on user_notes for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on user_notes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on user_notes for delete to authenticated using (auth.uid() = user_id);

-- saved_searches
alter table saved_searches enable row level security;

create policy "Users can view their own saved searches"
  on saved_searches for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert their own saved searches"
  on saved_searches for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own saved searches"
  on saved_searches for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own saved searches"
  on saved_searches for delete to authenticated using (auth.uid() = user_id);

-- user_value_overrides
alter table user_value_overrides enable row level security;

create policy "Users can view their own value overrides"
  on user_value_overrides for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert their own value overrides"
  on user_value_overrides for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own value overrides"
  on user_value_overrides for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own value overrides"
  on user_value_overrides for delete to authenticated using (auth.uid() = user_id);
