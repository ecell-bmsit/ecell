const mockGet = jest.fn();
const mockAppend = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    auth: { GoogleAuth: jest.fn(() => ({})) },
    sheets: jest.fn(() => ({
      spreadsheets: {
        values: { get: mockGet, append: mockAppend },
      },
    })),
  },
}));

const { appendSubmissionIfMissing, escapeCell } = require('./googleSheets.cjs');

describe('Google Sheets export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({ client_email: 'test@example.com' });
    process.env.GOOGLE_SHEET_ID = 'sheet-id';
    process.env.GOOGLE_SHEET_TAB_NAME = 'Ideas';
    mockGet.mockResolvedValue({ data: { values: [['Submission ID'], ['existing-id']] } });
    mockAppend.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    delete process.env.GOOGLE_SHEET_ID;
    delete process.env.GOOGLE_SHEET_TAB_NAME;
  });

  test.each(['=', '+', '-', '@'])('escapes formula prefix %s', (prefix) => {
    expect(escapeCell(`${prefix}formula`)).toBe(`'${prefix}formula`);
  });

  test('does not append a duplicate submission ID', async () => {
    const result = await appendSubmissionIfMissing({ id: 'existing-id' });
    expect(result).toEqual({ duplicate: true });
    expect(mockAppend).not.toHaveBeenCalled();
  });

  test('appends the supported submission fields', async () => {
    const result = await appendSubmissionIfMissing({
      id: 'new-id',
      created_at: '2026-10-10T00:00:00.000Z',
      name: '=Student',
      email: 'student@bmsit.in',
      idea: 'An idea',
      status: 'pending',
    });

    expect(result).toEqual({ duplicate: false });
    expect(mockAppend).toHaveBeenCalledWith(expect.objectContaining({
      spreadsheetId: 'sheet-id',
      range: 'Ideas!A:F',
      valueInputOption: 'RAW',
      requestBody: { values: [[
        'new-id',
        '2026-10-10T00:00:00.000Z',
        "'=Student",
        'student@bmsit.in',
        'An idea',
        'pending',
      ]] },
    }));
  });

  test('propagates an append failure for durable retry handling', async () => {
    mockAppend.mockRejectedValueOnce(new Error('Sheets unavailable'));
    await expect(appendSubmissionIfMissing({ id: 'new-id' })).rejects.toThrow('Sheets unavailable');
  });
});
