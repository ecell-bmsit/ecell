'use strict';

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const DEFAULT_SHEET_ID = '1vNDSGLK2HR8V-XkCbAtV291v57m48OthNQUTpyodJbI';
const DEFAULT_TAB_NAME = 'Sheet1';

function escapeCell(value) {
  const text = value == null ? '' : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  const configuredPath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  const secretsDir = path.resolve(__dirname, '../../backend/secrets');
  const localCredentialFile = fs.existsSync(secretsDir)
    ? fs.readdirSync(secretsDir).find((file) => file.endsWith('.json'))
    : null;
  const filePath = configuredPath
    ? path.resolve(configuredPath)
    : localCredentialFile ? path.join(secretsDir, localCredentialFile) : null;

  if (!filePath) throw new Error('Google Sheets credentials are not configured.');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function appendSubmissionIfMissing(submission) {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME || DEFAULT_TAB_NAME;
  const range = `${tabName}!A:A`;
  const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const ids = (existing.data.values || []).map((row) => row[0]);

  if (ids.includes(submission.id)) return { duplicate: true };

  const row = [
    escapeCell(submission.id),
    escapeCell(submission.created_at),
    escapeCell(submission.name),
    escapeCell(submission.email),
    escapeCell(submission.idea),
    escapeCell(submission.status || 'pending'),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:F`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  return { duplicate: false };
}

module.exports = { appendSubmissionIfMissing, escapeCell };
