const mockFrom = jest.fn();
const mockInsert = jest.fn();
const mockGetUser = jest.fn();
const mockRpc = jest.fn();
const mockExportSubmission = jest.fn();
const mockCreateClient = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient.mockImplementation(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

jest.mock('./export.cjs', () => ({
  exportSubmissionById: mockExportSubmission,
}));

const { submitIdeaHandler, validateIdeaBody } = require('./submit.cjs');

const response = () => ({
  setHeader: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  end: jest.fn(),
});

describe('Supabase idea submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
    process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS = 'bmsit.in';
    mockInsert.mockResolvedValue({ error: null });
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'submission-1',
            created_at: '2026-10-10T00:00:00.000Z',
            name: 'Student',
            email: 'student@bmsit.in',
            idea: 'A'.repeat(50),
            status: 'pending',
            sheet_export_status: 'pending',
            sheet_export_attempts: 0,
          },
          error: null,
        }),
      }),
    });
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockRpc.mockResolvedValue({
      data: {
        uidMatchesVerifiedUser: true,
        pendingMatchesPending: true,
        roleIsAuthenticated: true,
      },
      error: null,
    });
    mockExportSubmission.mockResolvedValue({ duplicate: false });
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'student@bmsit.in', email_confirmed_at: '2026-10-10' } },
      error: null,
    });
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    delete process.env.ALLOWED_COLLEGE_EMAIL_DOMAINS;
  });

  test('validates idea fields server-side', () => {
    expect(validateIdeaBody({ name: 'A', idea: 'short' }).errors).toHaveLength(2);
  });

  test('uses the verified user identity instead of body email or user id', async () => {
    const res = response();
    const token = `header.${Buffer.from(JSON.stringify({ sub: 'user-1' })).toString('base64url')}.signature`;
    await submitIdeaHandler({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { name: 'Student', email: 'attacker@example.com', idea: 'A'.repeat(50), auth_user_id: 'attacker' },
    }, res);

    expect(mockInsert).toHaveBeenCalledWith({
      auth_user_id: 'user-1',
      email: 'student@bmsit.in',
      name: 'Student',
      idea: 'A'.repeat(50),
      status: 'pending',
    });
    const [, , clientOptions] = mockCreateClient.mock.calls.at(-1);
    expect(clientOptions.global.headers.Authorization).toBe(`Bearer ${token}`);
    expect(clientOptions.global.fetch).toEqual(expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockRpc).toHaveBeenCalledWith('debug_idea_auth_context', {
      expected_user_id: 'user-1',
    });
  });

  test('configures a transport that verifies the student bearer token and API key', async () => {
    const res = response();
    const token = `header.${Buffer.from(JSON.stringify({ sub: 'user-1' })).toString('base64url')}.signature`;
    await submitIdeaHandler({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { name: 'Student', idea: 'A'.repeat(50) },
    }, res);

    const clientOptions = mockCreateClient.mock.calls.at(-1)[2];
    const originalFetch = global.fetch;
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    try {
      await clientOptions.global.fetch('https://example.supabase.co/rest/v1/idea_submissions', {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: 'test-publishable-key',
        },
      });
    } finally {
      global.fetch = originalFetch;
    }

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.supabase.co/rest/v1/idea_submissions',
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });

  test('continues the existing INSERT when the diagnostic RPC fails', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { code: '42883', message: 'function does not exist' },
    });
    const res = response();

    await submitIdeaHandler({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: { name: 'Student', idea: 'A'.repeat(50) },
    }, res);

    expect(mockInsert).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('keeps an RLS failure generic and never falls back to service-role insert', async () => {
    mockInsert.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { status: 42501, code: '42501', message: 'new row violates row-level security policy' },
        }),
      }),
    });
    const res = response();

    await submitIdeaHandler({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: { name: 'Student', idea: 'A'.repeat(50) },
    }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Failed to submit idea. Please try again later.',
    });
    expect(mockExportSubmission).not.toHaveBeenCalled();
  });

  test('rejects unauthenticated submissions', async () => {
    const res = response();
    await submitIdeaHandler({ method: 'POST', headers: {}, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  test('keeps a successful Supabase submission when Sheets export fails', async () => {
    mockExportSubmission.mockRejectedValueOnce(new Error('Sheets unavailable'));
    const res = response();

    await submitIdeaHandler({
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: { name: 'Student', idea: 'A'.repeat(50) },
    }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      submissionId: 'submission-1',
      sheetExport: 'pending',
    }));
  });
});
