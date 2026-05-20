-- Phone Down Ritual sessions
-- Stores each ritual a user starts/completes for progress tracking

create table if not exists phone_down_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes in (5, 10, 15, 30)),
  completed      boolean not null default false,
  started_at     timestamptz not null default now(),
  completed_at   timestamptz
);

-- Index for querying a user's sessions
create index if not exists phone_down_sessions_user_id_idx
  on phone_down_sessions (user_id, started_at desc);

-- Row level security
alter table phone_down_sessions enable row level security;

create policy "Users can read own phone down sessions"
  on phone_down_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own phone down sessions"
  on phone_down_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own phone down sessions"
  on phone_down_sessions for update
  using (auth.uid() = user_id);
