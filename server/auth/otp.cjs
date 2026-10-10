'use strict';

const { createClient } = require('@supabase/supabase-js');
const {
  AuthorizationError,
  AuthenticationError,
  getAllowedDomains,
  verifyCollegeAccessToken,
} = require('./supabaseAuth.cjs');

function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || email.split('@').length !== 2) return '';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain || !domain.includes('.') || /\s/.test(email)) return '';
  return email;
}

function isAllowedEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const domain = normalizedEmail.slice(normalizedEmail.lastIndexOf('@') + 1);
  return Boolean(normalizedEmail && getAllowedDomains().includes(domain));
}

function getAuthClient() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    const error = new Error('Authentication is not configured on the server.');
    error.statusCode = 503;
    throw error;
  }
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function requestOtpHandler(req, res) {
  const email = normalizeEmail(req.body?.email);
  if (!isAllowedEmail(email)) {
    return res.status(403).json({ error: 'Use your eligible college email address.' });
  }
  try {
    const { error } = await getAuthClient().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
    return res.status(200).json({ ok: true, message: 'If eligible, a verification code has been sent.' });
  } catch (error) {
    console.error('OTP request failed:', {
      status: error?.status || 500,
      code: error?.code || null,
      name: error?.name || null,
      message: String(error?.message || 'Unknown error').slice(0, 200),
    });
    return res.status(502).json({ error: 'Unable to send a verification code right now.' });
  }
}

async function verifyOtpHandler(req, res) {
  const email = normalizeEmail(req.body?.email);
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  if (!isAllowedEmail(email) || !/^\d{6}$/.test(token)) {
    return res.status(401).json({ error: 'The verification code is invalid or expired.' });
  }
  try {
    const { data, error } = await getAuthClient().auth.verifyOtp({ email, token, type: 'email' });
    const session = data?.session;
    const user = data?.user;
    if (error || !session?.access_token || !session?.refresh_token || !user?.email) {
      return res.status(401).json({ error: 'The verification code is invalid or expired.' });
    }
    const verified = await verifyCollegeAccessToken({
      headers: { authorization: `Bearer ${session.access_token}` },
    });
    return res.status(200).json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: { id: verified.user.id, email: verified.email },
    });
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof AuthenticationError) {
      return res.status(error.statusCode).json({ error: 'The verification code is invalid or expired.' });
    }
    console.error('OTP verification failed:', { status: error.status || 500 });
    return res.status(401).json({ error: 'The verification code is invalid or expired.' });
  }
}

async function sessionHandler(req, res) {
  try {
    const { user, email } = await verifyCollegeAccessToken(req);
    return res.status(200).json({ user: { id: user.id, email } });
  } catch (error) {
    return res.status(error.statusCode || 401).json({ error: 'Authentication required.' });
  }
}

async function logoutHandler(req, res) {
  try {
    await verifyCollegeAccessToken(req);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(error.statusCode || 401).json({ error: 'Authentication required.' });
  }
}

async function requireCollegeAuth(req, res, next) {
  try {
    req.auth = await verifyCollegeAccessToken(req);
    return next();
  } catch (error) {
    return res.status(error.statusCode || 401).json({ error: error.statusCode === 403 ? 'This account is not eligible.' : 'Authentication required.' });
  }
}

module.exports = {
  isAllowedEmail,
  logoutHandler,
  normalizeEmail,
  requestOtpHandler,
  requireCollegeAuth,
  sessionHandler,
  verifyOtpHandler,
};
