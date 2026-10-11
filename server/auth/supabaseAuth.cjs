'use strict';

const { createClient } = require('@supabase/supabase-js');

class AuthenticationError extends Error {
  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'This email domain is not allowed.') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

function getBearerToken(req) {
  const authorization = req?.headers?.authorization;
  if (typeof authorization !== 'string') return null;

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function getAllowedDomains() {
  return (process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS || '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

function getEmailDomain(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf('@');
  return atIndex > 0 ? normalizedEmail.slice(atIndex + 1) : '';
}

async function verifySupabaseAccessToken(req) {
  const token = getBearerToken(req);
  if (!token) throw new AuthenticationError();

  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new AuthenticationError('Authentication is not configured on the server.');
  }

  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  const user = data?.user;
  if (error || !user || typeof user.email !== 'string' || !user.email_confirmed_at) {
    throw new AuthenticationError();
  }

  return { user, email: user.email.trim().toLowerCase() };
}

async function verifyCollegeAccessToken(req) {
  const authenticated = await verifySupabaseAccessToken(req);
  const allowedDomains = getAllowedDomains();
  const emailDomain = getEmailDomain(authenticated.email);

  if (!allowedDomains.length || !allowedDomains.includes(emailDomain)) {
    throw new AuthorizationError();
  }

  return authenticated;
}

module.exports = {
  AuthenticationError,
  AuthorizationError,
  getAllowedDomains,
  getBearerToken,
  verifyCollegeAccessToken,
  verifySupabaseAccessToken,
};
