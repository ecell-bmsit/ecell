
'use strict';

const { createClient } = require('@supabase/supabase-js');
const { getAccountName, getBearerToken, verifyCollegeAccessToken } = require('../auth/supabaseAuth.cjs');
const { exportSubmissionById } = require('./export.cjs');

function validateIdeaBody(body, accountName = null) {
  const errors = [];
  const name = typeof accountName === 'string' ? accountName.trim() : '';
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const idea = typeof body?.idea === 'string' ? body.idea.trim() : '';

  if (name.length < 2 || name.length > 100) {
    errors.push({
      path: 'name',
      msg: 'Your account name is missing. Please update your account profile before submitting.',
    });
  }

  if (title.length < 3 || title.length > 120) {
    errors.push({ path: 'title', msg: 'Title must be between 3 and 120 characters' });
  }
  if (idea.length < 50 || idea.length > 5000) {
    errors.push({
      path: 'idea',
      msg: 'Idea must be between 50 and 5000 characters',
    });
  }

  return { errors, name, title, idea };
}

function getUserScopedClient(req) {
  const token = getBearerToken(req);
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!token || !url || !publishableKey) {
    throw new Error('Supabase submission client is not configured.');
  }

  const submissionFetch = async (input, init = {}) => {
    const requestUrl = input instanceof URL ? input : new URL(input.url || input);
    const headers = new Headers(init.headers);
    const authorization = headers.get('authorization');
    const apiKey = headers.get('apikey');

    console.warn('Idea submission transport diagnostic:', {
      host: requestUrl.host,
      path: requestUrl.pathname,
      hasAuthorization: Boolean(authorization),
      authorizationMatchesStudentToken: authorization === `Bearer ${token}`,
      hasApiKey: Boolean(apiKey),
      apiKeyMatchesConfiguredKey: apiKey === publishableKey,
    });

    return fetch(input, { ...init, headers });
  };

  return createClient(url, publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      fetch: submissionFetch,
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function getJwtSubjectForDiagnostic(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8')
    );

    return {
      subject: typeof payload.sub === 'string' ? payload.sub : null,
      role: payload.role,
      audience: payload.aud,
    };
  } catch {
    return null;
  }
}

async function submitIdeaHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const authenticated = await verifyCollegeAccessToken(req);
    const { errors, name, title, idea } = validateIdeaBody(req.body, getAccountName(authenticated.user));

    if (errors.length) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    const token = getBearerToken(req);
    const jwtClaims = token ? getJwtSubjectForDiagnostic(token) : null;

    // Temporary, sanitized diagnostics. Never log the token or user content.
    console.warn('Idea auth diagnostic:', {
      hasBearerToken: Boolean(token),
      verifiedUserId: authenticated.user.id,
      jwtSubjectMatchesVerifiedUser:
        jwtClaims?.subject !== null &&
        jwtClaims?.subject === authenticated.user.id,
      jwtSubjectPresent: jwtClaims?.subject !== null,
      jwtRoleIsAuthenticated: jwtClaims?.role === 'authenticated',
      jwtAudienceIsAuthenticated: jwtClaims?.audience === 'authenticated',
      insertStatus: 'pending',
      supabaseProjectConfigured: Boolean(process.env.SUPABASE_URL),
    });

    const supabase = getUserScopedClient(req);

    let authContext = null;
    try {
      const { data } = await supabase.rpc(
        'debug_idea_auth_context',
        { expected_user_id: authenticated.user.id }
      );
      authContext = data;
    } catch {
      authContext = null;
    }
    console.warn('Idea database auth context diagnostic:', {
      uidMatchesVerifiedUser: authContext?.uidMatchesVerifiedUser ?? null,
      pendingMatchesPending: authContext?.pendingMatchesPending ?? null,
      roleIsAuthenticated: authContext?.roleIsAuthenticated ?? null,
    });

    const insertPayload = {
      auth_user_id: authenticated.user.id,
      email: authenticated.email,
      name,
      title,
      idea,
      status: 'pending',
    };

    console.warn('Idea INSERT payload diagnostic:', {
      insertAuthUserIdMatchesVerifiedUser:
        insertPayload.auth_user_id === authenticated.user.id,
      insertStatusIsPending: insertPayload.status === 'pending',
      insertPayloadKeys: Object.keys(insertPayload),
    });

    const { data: submission, error } = await supabase
      .from('idea_submissions')
      .insert(insertPayload)
      .select(
        'id,created_at,name,email,title,idea,status,sheet_export_status,sheet_export_attempts'
      )
      .single();

    if (error) {
      console.error('Idea INSERT diagnostic:', {
        code: error.code || null,
        status: error.status || null,
        message:
          error.code === '42501'
            ? String(error.message || 'RLS rejected the INSERT.').slice(0, 200)
            : 'Supabase INSERT failed.',
      });

      throw error;
    }

    let sheetExport = 'pending';

    try {
      await exportSubmissionById(submission.id);
      sheetExport = 'exported';
    } catch (exportError) {
      console.error('Idea saved but Google Sheets export is pending:', {
        status:
          exportError?.status || exportError?.statusCode || null,
        code: exportError?.code || null,
        name: exportError?.name || null,
        message: String(
          exportError?.message || 'Unknown export error'
        ).slice(0, 200),
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Idea submitted successfully! Thank you for sharing your vision.',
      submissionId: submission.id,
      sheetExport,
    });
  } catch (error) {
    console.error('Idea submission error:', {
      status: error?.status || error?.statusCode || 500,
      code: error?.code || null,
      name: error?.name || null,
      message:
        error?.code === '42501'
          ? String(error?.message || 'Row-level security rejected the INSERT.').slice(0, 200)
          : String(error?.message || 'Unknown error').slice(0, 200),
    });

    const statusCode =
      error?.statusCode === 401 || error?.statusCode === 403
        ? error.statusCode
        : 500;

    return res.status(statusCode).json({
      success: false,
      error:
        statusCode === 401
          ? 'Authentication required.'
          : statusCode === 403
            ? 'This account is not eligible.'
            : 'Failed to submit idea. Please try again later.',
    });
  }
}

async function myIdeasHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const authenticated = await verifyCollegeAccessToken(req);
    const supabase = getUserScopedClient(req);

    const { data: submissions, error } = await supabase
      .from('idea_submissions')
      .select('id,created_at,name,email,title,idea,status,ai_gaps,ai_assessment,evaluation_answers')
      .eq('auth_user_id', authenticated.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch ideas error:', error);
      throw error;
    }

    return res.status(200).json({
      success: true,
      ideas: submissions || [],
    });
  } catch (error) {
    const statusCode =
      error?.statusCode === 401 || error?.statusCode === 403
        ? error.statusCode
        : 500;

    return res.status(statusCode).json({
      success: false,
      error:
        statusCode === 401
          ? 'Authentication required.'
          : statusCode === 403
            ? 'This account is not eligible.'
            : 'Failed to fetch previous ideas.',
      ideas: [],
    });
  }
}

module.exports = {
  submitIdeaHandler,
  myIdeasHandler,
  validateIdeaBody,
};








