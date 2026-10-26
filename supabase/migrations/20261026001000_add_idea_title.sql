alter table public.idea_submissions
  add column if not exists title text;

update public.idea_submissions
set title = left(btrim(split_part(idea, E'\n', 1)), 120)
where title is null;

update public.idea_submissions
set title = 'Untitled idea'
where title is null or char_length(btrim(title)) < 3;

alter table public.idea_submissions
  alter column title set default 'Untitled idea',
  alter column title set not null;

alter table public.idea_submissions
  add constraint idea_submissions_title_length_check
  check (char_length(title) between 3 and 120);
