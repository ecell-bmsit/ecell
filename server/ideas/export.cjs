'use strict';

const { createClient } = require('@supabase/supabase-js');
const { appendSubmissionIfMissing } = require('../sheets/googleSheets.cjs');

function safeDiagnostic(error) {
  return {
    operation: error?.exportOperation || null,
    status: error?.status || error?.statusCode || null,
    code: error?.code || null,
    name: error?.name || null,
    message: String(error?.message || 'Unknown export error').slice(0, 200),
  };
}

function markExportOperation(error, operation) {
  if (error && typeof error === 'object') error.exportOperation = operation;
  return error;
}

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase export client is not configured.');
  }
  if (serviceRoleKey === process.env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase export client must use the service-role key.');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function updateExportState(client, id, values) {
  const { error } = await client.from('idea_submissions').update(values).eq('id', id);
  if (error) throw markExportOperation(error, 'update idea_submissions export state');
}

async function exportSubmissionById(id, client = getAdminClient()) {
  const { data: submission, error } = await client
    .from('idea_submissions')
    .select('id,created_at,name,email,idea,status,sheet_export_status,sheet_export_attempts')
    .eq('id', id)
    .maybeSingle();
  if (error) throw markExportOperation(error, 'select idea_submissions for export');
  if (!submission) throw new Error('Submission was not found.');
  if (submission.sheet_export_status === 'exported') return { duplicate: true };

  await updateExportState(client, id, {
    sheet_export_status: 'pending',
    sheet_export_attempts: (submission.sheet_export_attempts || 0) + 1,
    sheet_export_last_error: null,
  });

  try {
    const result = await appendSubmissionIfMissing(submission);
    await updateExportState(client, id, {
      sheet_export_status: 'exported',
      sheet_exported_at: new Date().toISOString(),
      sheet_export_last_error: null,
    });
    return result;
  } catch (exportError) {
    const diagnostic = safeDiagnostic(exportError);
    console.error('Google Sheets export error:', diagnostic);
    try {
      await updateExportState(client, id, {
        sheet_export_status: 'failed',
        sheet_export_last_error: diagnostic.message,
      });
    } catch (stateError) {
      console.error('Google Sheets export state error:', safeDiagnostic(stateError));
    }
    throw exportError;
  }
}

async function retryPendingExports(limit = 20) {
  const client = getAdminClient();
  const { data, error } = await client
    .from('idea_submissions')
    .select('id')
    .in('sheet_export_status', ['pending', 'failed'])
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw markExportOperation(error, 'select pending idea_submissions for retry');

  const results = [];
  for (const row of data || []) {
    try {
      results.push({ id: row.id, success: true, ...(await exportSubmissionById(row.id, client)) });
    } catch (error) {
      results.push({ id: row.id, success: false, error: safeDiagnostic(error) });
    }
  }
  return results;
}

module.exports = { exportSubmissionById, retryPendingExports, safeDiagnostic };
