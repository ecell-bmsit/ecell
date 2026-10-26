'use strict';

const { createClient } = require('@supabase/supabase-js');
const { verifyCollegeAccessToken } = require('../auth/supabaseAuth.cjs');
const { requestIdeaEvaluation } = require('../counsel/feedback.cjs');
const { updateEvaluationInSheet } = require('../sheets/googleSheets.cjs');

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || key === process.env.SUPABASE_PUBLISHABLE_KEY) throw new Error('Supabase evaluation storage is not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

async function saveIdeaEvaluationHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { user } = await verifyCollegeAccessToken(req);
    const { submissionId, answers } = req.body || {};
    if (typeof submissionId !== 'string' || !Array.isArray(answers) || answers.length !== 5 || answers.some((a) => typeof a !== 'string' || !a.trim() || a.length > 3000)) {
      return res.status(400).json({ success: false, error: 'Please answer all five questions (up to 3,000 characters each).' });
    }
    const client = getAdminClient();
    const { data: submission, error: readError } = await client.from('idea_submissions').select('id,auth_user_id,idea').eq('id', submissionId).maybeSingle();
    if (readError) throw readError;
    if (!submission || submission.auth_user_id !== user.id) return res.status(404).json({ success: false, error: 'Submission not found.' });

    const cleanAnswers = answers.map((answer) => answer.trim());
    const evaluation = await requestIdeaEvaluation(submission.idea, cleanAnswers);
    const evaluatedAt = new Date().toISOString();
    const aiGaps = `${evaluation.summary}\n\n${evaluation.gaps.map((gap) => `• ${gap}`).join('\n')}`;
    const { error: updateError } = await client.from('idea_submissions').update({
      evaluation_answers: cleanAnswers,
      ai_score: evaluation.score,
      ai_gaps: aiGaps,
      evaluated_at: evaluatedAt,
    }).eq('id', submissionId);
    if (updateError) throw updateError;

    let teamExport = 'exported';
    try {
      await updateEvaluationInSheet({ id: submissionId, ...evaluation, evaluatedAt });
    } catch (error) {
      teamExport = 'failed';
      console.error('Evaluation saved but Google Sheets update failed:', String(error?.message || 'Unknown error').slice(0, 200));
    }
    return res.status(200).json({ success: true, summary: evaluation.summary, gaps: evaluation.gaps, teamExport, evaluatedAt });
  } catch (error) {
    const status = error?.statusCode === 401 || error?.statusCode === 403 ? error.statusCode : 500;
    console.error('Save idea evaluation failed:', { status, message: String(error?.message || 'Unknown error').slice(0, 200) });
    return res.status(status).json({ success: false, error: status === 401 ? 'Authentication required.' : 'Unable to complete this evaluation.' });
  }
}

module.exports = { saveIdeaEvaluationHandler };
