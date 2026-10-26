alter table public.idea_submissions
  add column if not exists evaluation_answers jsonb,
  add column if not exists ai_score integer check (ai_score is null or (ai_score >= 0 and ai_score <= 100)),
  add column if not exists ai_gaps text,
  add column if not exists evaluated_at timestamptz;
