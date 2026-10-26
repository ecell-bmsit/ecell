create or replace function public.enforce_idea_submission_limit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_submission_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.auth_user_id::text, 0));

  select count(*)
    into current_submission_count
    from public.idea_submissions
    where auth_user_id = new.auth_user_id;

  if current_submission_count >= 5 then
    raise exception 'Idea submission limit reached'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_idea_submission_limit on public.idea_submissions;
create trigger enforce_idea_submission_limit
before insert on public.idea_submissions
for each row
execute function public.enforce_idea_submission_limit();