-- The export worker is a trusted server-side process. It only needs to read
-- submissions and update the export-status columns; student RLS policies stay
-- unchanged and RLS remains enabled.
grant select, update
on table public.idea_submissions
to service_role;
