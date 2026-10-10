alter table public.idea_submissions
  add column if not exists sheet_export_status text not null default 'pending'
    check (sheet_export_status in ('pending', 'failed', 'exported')),
  add column if not exists sheet_export_attempts integer not null default 0
    check (sheet_export_attempts >= 0),
  add column if not exists sheet_exported_at timestamptz,
  add column if not exists sheet_export_last_error text;

create index if not exists idea_submissions_sheet_export_idx
  on public.idea_submissions (sheet_export_status, created_at);
