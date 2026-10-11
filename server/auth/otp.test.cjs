const mockAuth = {
  signInWithOtp: jest.fn(),
  verifyOtp: jest.fn(),
  getUser: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: mockAuth })),
}));

const {
  isAllowedEmail,
  logoutHandler,
  requestOtpHandler,
  verifyOtpHandler,
} = require('./otp.cjs');

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('email OTP handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
    process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS = 'bmsit.in';
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS;
  });

  test('allows only the exact configured domain', () => {
    expect(isAllowedEmail(' Student@BMSIT.IN ')).toBe(true);
    expect(isAllowedEmail('student@sub.bmsit.in')).toBe(false);
    expect(isAllowedEmail('student@example.com')).toBe(false);
    process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS = '';
    expect(isAllowedEmail('student@bmsit.in')).toBe(false);
  });

  test('rejects an OTP request for an ineligible domain', async () => {
    const res = response();
    await requestOtpHandler({ body: { email: 'student@sub.bmsit.in' } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockAuth.signInWithOtp).not.toHaveBeenCalled();
  });

  test('returns a safe error when OTP sending fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const providerMessage = 'SMTP provider rejected the request with additional details '.repeat(8);
    mockAuth.signInWithOtp.mockResolvedValue({
      error: {
        status: 550,
        code: 'smtp_failure',
        name: 'AuthApiError',
        message: providerMessage,
      },
    });
    const res = response();
    await requestOtpHandler({ body: { email: 'student@bmsit.in' } }, res);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unable to send a verification code right now.' });
    expect(consoleError).toHaveBeenCalledWith('OTP request failed:', {
      status: 550,
      code: 'smtp_failure',
      name: 'AuthApiError',
      message: providerMessage.slice(0, 200),
    });
    consoleError.mockRestore();
  });

  test('rejects a wrong or expired OTP without creating a session', async () => {
    mockAuth.verifyOtp.mockResolvedValue({ data: { session: null, user: null }, error: new Error('expired') });
    const res = response();
    await verifyOtpHandler({ body: { email: 'student@bmsit.in', token: '000000' } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'The verification code is invalid or expired.' });
  });

  test('logout rejects a missing access token', async () => {
    const res = response();
    await logoutHandler({ headers: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
