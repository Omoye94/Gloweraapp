-- RPC for users to delete their own account
-- Uses security definer so it runs with elevated privileges to delete from auth.users
create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Cascade deletes handle related rows automatically via FK constraints
  delete from auth.users where id = auth.uid();
end;
$$;

-- Only authenticated users can call this
revoke all on function delete_user() from public;
grant execute on function delete_user() to authenticated;
