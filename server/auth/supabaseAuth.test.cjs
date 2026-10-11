const mockGetUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: { getUser: mockGetUser } })),
}));

const {
  verifyCollegeAccessToken,
  verifySupabaseAccessToken,
} = require('./supabaseAuth.cjs');

const request = (authorization) => ({
  headers: authorization ? { authorization } : {},
});

describe('Supabase access-token verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
    process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS = 'students.example.edu';
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS;
  });

  test('rejects a missing token', async () => {
    await expect(verifySupabaseAccessToken(request())).rejects.toMatchObject({ statusCode: 401 });
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  test('rejects an invalid or expired token', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid token') });

    await expect(verifySupabaseAccessToken(request('Bearer expired-token')))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  test('returns the verified email and enforces exact domain matching', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'Student@Students.Example.Edu',
          email_confirmed_at: '2026-10-10T00:00:00.000Z',
        },
      },
      error: null,
    });

    await expect(verifyCollegeAccessToken(request('Bearer valid-token')))
      .resolves.toMatchObject({ email: 'student@students.example.edu' });

    process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS = '';
    await expect(verifyCollegeAccessToken(request('Bearer valid-token')))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});
