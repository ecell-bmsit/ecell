alter table public.idea_submissions
  add column if not exists ai_assessment jsonb;
