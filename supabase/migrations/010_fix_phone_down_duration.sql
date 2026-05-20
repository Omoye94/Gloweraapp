-- Fix phone_down_sessions duration_minutes constraint
-- Original migration 008 only allowed (5, 10, 15, 30) but custom durations (1-120) are now supported

alter table phone_down_sessions
  drop constraint if exists phone_down_sessions_duration_minutes_check;

alter table phone_down_sessions
  add constraint phone_down_sessions_duration_minutes_check
  check (duration_minutes >= 1 and duration_minutes <= 120);
