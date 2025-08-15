const express = require('express');
const { query } = require('~/lib/pg');
const { requireJwtAuth, checkAdmin } = require('~/server/middleware');
const { refreshMaterializedView, refreshAllMaterializedViews } = require('~/server/services/analyticsViews');

const router = express.Router();
router.use(requireJwtAuth, checkAdmin);

function parseDateRange(req) {
  const { from, to } = req.query || {};
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  // ISO date only
  const toISO = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
  return { fromISO: toISO(start), toISO: toISO(end) };
}

// GET /summary?from&to
router.get('/summary', async (req, res) => {
  try {
    const { fromISO, toISO } = parseDateRange(req);
    const { rows } = await query(
      `SELECT day, visits, bot_visits, human_visits
       FROM mv_daily_visits
       WHERE day >= $1::date AND day <= $2::date
       ORDER BY day ASC`,
      [fromISO, toISO]
    );
    return res.status(200).json(rows);
  } catch (e) {
    console.error('[analytics-metrics] summary error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// GET /events?type&from&to
router.get('/events', async (req, res) => {
  try {
    const { type } = req.query || {};
    const { fromISO, toISO } = parseDateRange(req);
    const params = [fromISO, toISO];
    let sql = `SELECT day, type, cnt FROM mv_event_counts WHERE day >= $1::date AND day <= $2::date`;
    if (type) { sql += ` AND type = $3`; params.push(String(type)); }
    sql += ` ORDER BY day ASC`;
    const { rows } = await query(sql, params);
    return res.status(200).json(rows);
  } catch (e) {
    console.error('[analytics-metrics] events error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// GET /funnels/mas_to_faq?from&to
router.get('/funnels/mas_to_faq', async (req, res) => {
  try {
    const { fromISO, toISO } = parseDateRange(req);
    const { rows } = await query(
      `SELECT day, visits, faq_mas, conv_rate_pct
       FROM mv_funnel_mas_to_faq
       WHERE day >= $1::date AND day <= $2::date
       ORDER BY day ASC`,
      [fromISO, toISO]
    );
    return res.status(200).json(rows);
  } catch (e) {
    console.error('[analytics-metrics] funnel mas_to_faq error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// GET /referrals/social?platform&from&to
router.get('/referrals/social', async (req, res) => {
  try {
    const { platform } = req.query || {};
    const { fromISO, toISO } = parseDateRange(req);
    const params = [fromISO, toISO];
    let sql = `SELECT day, platform, sm_user, visits
               FROM mv_referrals_social
               WHERE day >= $1::date AND day <= $2::date`;
    if (platform) { sql += ` AND platform = $3`; params.push(String(platform)); }
    sql += ` ORDER BY day ASC, platform ASC, sm_user ASC`;
    const { rows } = await query(sql, params);
    return res.status(200).json(rows);
  } catch (e) {
    console.error('[analytics-metrics] referrals social error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /refresh  { view?: string }
router.post('/refresh', async (req, res) => {
  try {
    const { view } = req.body || {};
    if (view) {
      await refreshMaterializedView(String(view));
      return res.status(200).json({ status: 'ok', refreshed: view });
    }
    await refreshAllMaterializedViews();
    return res.status(200).json({ status: 'ok', refreshed: 'all' });
  } catch (e) {
    const code = e?.message === 'unknown_view' ? 400 : 500;
    console.error('[analytics-metrics] refresh error', e);
    return res.status(code).json({ error: e?.message || 'internal_error' });
  }
});

module.exports = router;
