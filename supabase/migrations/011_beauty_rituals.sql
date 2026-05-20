-- Beauty Rituals feature
-- Tracks user beauty/self-care rituals and daily completions

create table if not exists beauty_rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null,
  time_of_day text not null check (time_of_day in ('morning', 'evening', 'anytime', 'weekly')),
  frequency text not null check (frequency in ('daily', 'selected_days', 'weekly')),
  selected_days text[] null,
  notes text null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists beauty_ritual_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ritual_id uuid references beauty_rituals(id) on delete cascade not null,
  completion_date date not null,
  completed_at timestamptz default now() not null,
  unique(user_id, ritual_id, completion_date)
);

-- RLS
alter table beauty_rituals enable row level security;
alter table beauty_ritual_completions enable row level security;

create policy "Users manage own beauty rituals"
  on beauty_rituals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own beauty ritual completions"
  on beauty_ritual_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast date-based completion lookups
create index if not exists idx_beauty_completions_user_date
  on beauty_ritual_completions(user_id, completion_date);
