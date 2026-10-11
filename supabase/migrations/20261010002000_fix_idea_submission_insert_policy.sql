drop policy if exists "Students can insert their own ideas"
on public.idea_submissions;

create policy "Students can insert their own ideas"
  on public.idea_submissions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = auth_user_id
    and status = 'pending'
  );
