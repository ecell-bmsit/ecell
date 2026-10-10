const mockCreateClient = jest.fn();
const mockAppendSubmissionIfMissing = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

jest.mock('../sheets/googleSheets.cjs', () => ({
  appendSubmissionIfMissing: mockAppendSubmissionIfMissing,
}));

const { exportSubmissionById } = require('./export.cjs');

function createExportClient() {
  const updateEq = jest.fn().mockResolvedValue({ error: null });
  const update = jest.fn().mockReturnValue({ eq: updateEq });
  const maybeSingle = jest.fn().mockResolvedValue({
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
  });
  const select = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({ maybeSingle }),
  });

  return {
    from: jest.fn(() => ({ select, update })),
    update,
    updateEq,
    select,
  };
}

describe('Supabase export client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'publishable-test-key';
    mockAppendSubmissionIfMissing.mockResolvedValue({ duplicate: false });
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
  });

  test('uses the service-role key for export reads and status updates', async () => {
    const client = createExportClient();
    mockCreateClient.mockReturnValue(client);

    await exportSubmissionById('submission-1');

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'service-role-test-key',
      expect.objectContaining({
        auth: expect.objectContaining({ persistSession: false }),
      }),
    );
    expect(mockCreateClient).not.toHaveBeenCalledWith(
      expect.anything(),
      'publishable-test-key',
      expect.anything(),
    );
    expect(client.update).toHaveBeenCalledWith(expect.objectContaining({
      sheet_export_status: 'exported',
    }));
  });

  test('rejects a publishable key accidentally configured as the export key', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    await expect(exportSubmissionById('submission-1')).rejects.toThrow(
      'must use the service-role key',
    );
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});
