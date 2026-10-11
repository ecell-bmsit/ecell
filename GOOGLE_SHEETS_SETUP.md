# Google Sheets export setup

Supabase `public.idea_submissions` remains the source of truth. The server attempts a Sheets export after a successful insert and records the export state on that same Supabase row. Failed exports remain retryable through `/api/internal/retry-sheet-exports`.

## Local development

Keep the downloaded service-account JSON under the ignored `backend/secrets/` directory. Do not commit it. Set these variables in `backend/.env`:

```text
GOOGLE_SERVICE_ACCOUNT_FILE=./secrets/<service-account-file>.json
GOOGLE_SHEET_ID=1vNDSGLK2HR8V-XkCbAtV291v57m48OthNQUTpyodJbI
GOOGLE_SHEET_TAB_NAME=Sheet1
SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service-role key>
CRON_SECRET=<random server-only retry secret>
```

When the backend is started from `backend/`, the relative credentials path resolves to `backend/secrets/`. The implementation also accepts `GOOGLE_SERVICE_ACCOUNT_JSON` for deployment; never put either credential form in frontend/Vite variables.

Share the target spreadsheet with the service account as an editor. The sheet’s first column must contain the stable submission ID; the exporter writes ID, submitted time, name, verified email, idea, and status in columns A–F.

## Vercel

Configure the following as server-side Vercel environment variables for Preview and Production as appropriate:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (the complete JSON credential as one environment-variable value)
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_TAB_NAME`
- `CRON_SECRET`

The service account must have editor access to the target sheet. Vercel’s cron service calls `/api/internal/retry-sheet-exports` every five minutes using the configured cron authorization. Confirm that the selected Vercel plan supports the configured cron frequency; the endpoint can also be invoked manually with `Authorization: Bearer <CRON_SECRET>`.

The retry migration must be applied before deploying the code:

```sql
supabase/migrations/20261010001000_add_sheet_export_state.sql
```
