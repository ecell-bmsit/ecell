create table if not exists public.idea_submissions (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text not null check (char_length(name) between 2 and 100),
  idea text not null check (char_length(idea) between 50 and 5000),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idea_submissions_auth_user_id_idx
  on public.idea_submissions (auth_user_id);

alter table public.idea_submissions enable row level security;

grant insert, select on table public.idea_submissions to authenticated;

drop policy if exists "Students can insert their own ideas" on public.idea_submissions;
create policy "Students can insert their own ideas"
  on public.idea_submissions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = auth_user_id
    and lower(email) = lower((select auth.jwt() ->> 'email'))
    and status = 'pending'
  );

drop policy if exists "Students can read their own ideas" on public.idea_submissions;
create policy "Students can read their own ideas"
  on public.idea_submissions
  for select
  to authenticated
  using ((select auth.uid()) = auth_user_id);
