const express = require('express');
const crypto = require('crypto');
const { query } = require('~/lib/pg');
const { invalidateBlocklist } = require('~/server/services/analyticsBlocklistCache');
const { requireJwtAuth, checkAdmin } = require('~/server/middleware');

const router = express.Router();

router.use(requireJwtAuth, checkAdmin);

// Settings
router.get('/settings', async (req, res) => {
  try {
    const r = await query('SELECT id, retention_days, bot_threshold, allow_raw_ip, updated_at FROM analytics_settings WHERE id = 1');
    return res.status(200).json(r.rows[0] || null);
  } catch (e) {
    console.error('[analytics-admin] get settings error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { retention_days, bot_threshold, allow_raw_ip } = req.body || {};
    const r = await query(
      `UPDATE analytics_settings
       SET retention_days = COALESCE($1, retention_days),
           bot_threshold = COALESCE($2, bot_threshold),
           allow_raw_ip = COALESCE($3, allow_raw_ip),
           updated_at = now()
       WHERE id = 1
       RETURNING id, retention_days, bot_threshold, allow_raw_ip, updated_at`,
      [retention_days, bot_threshold, allow_raw_ip]
    );
    return res.status(200).json(r.rows[0]);
  } catch (e) {
    console.error('[analytics-admin] update settings error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Blocklist
router.get('/blocklist', async (_req, res) => {
  try {
    const r = await query('SELECT id, type, pattern, reason, created_at FROM analytics_blocklist ORDER BY created_at DESC');
    return res.status(200).json(r.rows);
  } catch (e) {
    console.error('[analytics-admin] list blocklist error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.post('/blocklist', async (req, res) => {
  try {
    const { type, pattern, reason } = req.body || {};
    if (!type || !pattern) return res.status(400).json({ error: 'missing_fields' });
    const r = await query(
      'INSERT INTO analytics_blocklist (type, pattern, reason) VALUES ($1,$2,$3) RETURNING id, type, pattern, reason, created_at',
      [type, pattern, reason || null]
    );
    try { invalidateBlocklist(); } catch {}
    return res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error('[analytics-admin] add blocklist error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.delete('/blocklist/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query('DELETE FROM analytics_blocklist WHERE id = $1', [id]);
    try { invalidateBlocklist(); } catch {}
    return res.status(204).end();
  } catch (e) {
    console.error('[analytics-admin] delete blocklist error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Webhooks
router.get('/webhooks', async (_req, res) => {
  try {
    const r = await query('SELECT id, url, event, is_enabled, created_at FROM analytics_webhooks ORDER BY created_at DESC');
    return res.status(200).json(r.rows);
  } catch (e) {
    console.error('[analytics-admin] list webhooks error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.post('/webhooks', async (req, res) => {
  try {
    const { url, event, secret } = req.body || {};
    if (!url || !event) return res.status(400).json({ error: 'missing_fields' });
    const secret_hash = secret ? crypto.createHash('sha256').update(secret).digest('hex') : null;
    const r = await query(
      'INSERT INTO analytics_webhooks (url, event, secret_hash) VALUES ($1,$2,$3) RETURNING id, url, event, is_enabled, created_at',
      [url, event, secret_hash]
    );
    return res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error('[analytics-admin] add webhook error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.delete('/webhooks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query('DELETE FROM analytics_webhooks WHERE id = $1', [id]);
    return res.status(204).end();
  } catch (e) {
    console.error('[analytics-admin] delete webhook error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// API Keys
function generateApiKey() {
  return 'opra_' + crypto.randomBytes(24).toString('base64url');
}

router.get('/api-keys', async (_req, res) => {
  try {
    const r = await query('SELECT id, label, scope, created_at, revoked_at FROM analytics_api_keys ORDER BY created_at DESC');
    return res.status(200).json(r.rows);
  } catch (e) {
    console.error('[analytics-admin] list api keys error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.post('/api-keys', async (req, res) => {
  try {
    const { label, scope } = req.body || {};
    const plaintext = generateApiKey();
    const key_hash = crypto.createHash('sha256').update(plaintext).digest('hex');
    const r = await query(
      'INSERT INTO analytics_api_keys (key_hash, label, scope) VALUES ($1,$2,$3) RETURNING id, label, scope, created_at',
      [key_hash, label || null, scope || 'admin']
    );
    return res.status(201).json({ ...r.rows[0], api_key: plaintext });
  } catch (e) {
    console.error('[analytics-admin] create api key error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

router.delete('/api-keys/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query('DELETE FROM analytics_api_keys WHERE id = $1', [id]);
    return res.status(204).end();
  } catch (e) {
    console.error('[analytics-admin] delete api key error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
