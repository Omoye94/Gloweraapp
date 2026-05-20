-- Gratitude Jar entries
-- Stores gratitude entries a user adds to their jar over time

create table if not exists gratitude_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  content      text not null,
  emoji        text not null default '✨',
  created_at   timestamptz not null default now()
);

create index if not exists gratitude_entries_user_id_idx
  on gratitude_entries (user_id, created_at desc);

alter table gratitude_entries enable row level security;

create policy "Users can read own gratitude entries"
  on gratitude_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own gratitude entries"
  on gratitude_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own gratitude entries"
  on gratitude_entries for delete
  using (auth.uid() = user_id);
