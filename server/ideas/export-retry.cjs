'use strict';

const { retryPendingExports } = require('./export.cjs');

function authorized(req) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers?.authorization || '';
  return Boolean(secret && header === `Bearer ${secret}`);
}

async function retryExportsHandler(req, res) {
  if (!authorized(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const results = await retryPendingExports();
    return res.json({ success: true, results });
  } catch (error) {
    console.error('Google Sheets retry error:', {
      status: error?.status || error?.statusCode || null,
      code: error?.code || null,
      name: error?.name || null,
      message: String(error?.message || 'Unknown retry error').slice(0, 200),
    });
    return res.status(500).json({ success: false, error: 'Retry failed.' });
  }
}

module.exports = { retryExportsHandler };
