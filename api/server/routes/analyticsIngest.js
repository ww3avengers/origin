const express = require('express');
const UAParser = require('ua-parser-js');
const { query } = require('~/lib/pg');
const { parseSocial } = require('~/server/services/social');
const { scoreBot } = require('~/server/services/botScore');
const { dispatchWebhook } = require('~/server/services/analyticsWebhooks');
const { getBlocklist } = require('~/server/services/analyticsBlocklistCache');

const router = express.Router();

function matchPattern(val, pattern) {
  if (!val || !pattern) return false;
  try {
    // /pattern/flags format with optional flags
    const m = String(pattern).match(/^\/(.*)\/([a-z]*)$/i);
    if (m) {
      const body = m[1];
      const flags = m[2] || '';
      const re = new RegExp(body, flags);
      return re.test(val);
    }
    // if looks like regex tokens, try as regex without flags
    if (/[*^$.+?()|\\[\\]{}]/.test(pattern)) {
      const re = new RegExp(pattern);
      return re.test(val);
    }
    return String(val).includes(pattern);
  } catch {
    return String(val).includes(pattern);
  }
}

async function isBlocked({ ip, ua, referrer }) {
  const list = await getBlocklist();
  for (const item of list) {
    if (item.type === 'ip' && matchPattern(ip, item.pattern)) return true;
    if (item.type === 'user_agent' && matchPattern(ua, item.pattern)) return true;
    if (item.type === 'referrer' && matchPattern(referrer || '', item.pattern)) return true;
  }
  return false;
}

function parseUtm(u) {
  try {
    const url = new URL(u);
    const p = url.searchParams;
    return {
      utm_source: p.get('utm_source'),
      utm_medium: p.get('utm_medium'),
      utm_campaign: p.get('utm_campaign'),
      utm_term: p.get('utm_term'),
      utm_content: p.get('utm_content'),
    };
  } catch {
    return {};
  }
}

function uaInfo(ua) {
  const p = new UAParser(ua || '');
  return {
    device: p.getDevice()?.type || 'desktop',
    browser: p.getBrowser()?.name || null,
    os: p.getOS()?.name || null,
  };
}

// POST /api/analytics/ingest/visit
router.post('/visit', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const ua = req.headers['user-agent'] || '';
    const acceptLang = req.headers['accept-language'] || null;
    const { url, referrer, sessionId, visitorId } = req.body || {};
    // Blocklist enforcement
    if (await isBlocked({ ip, ua, referrer })) {
      return res.status(202).json({ status: 'blocked' });
    }
    const utm = parseUtm(url || '');
    const { device, browser, os } = uaInfo(ua);
    const botScore = scoreBot({ userAgent: ua, acceptLang: acceptLang || '' });
    const isBot = botScore >= 70;
    const { sm_platform, sm_user } = parseSocial(req);

    const sql = `INSERT INTO visits
      (session_id, visitor_id, ip, user_agent, accept_lang, referrer, url,
       utm_source, utm_medium, utm_campaign, utm_term, utm_content,
       sm_platform, sm_user, device, browser, os, is_bot, bot_score)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING id`;
    const vals = [
      sessionId || null,
      visitorId || null,
      ip || null,
      ua || null,
      acceptLang,
      referrer || null,
      url || null,
      utm.utm_source || null,
      utm.utm_medium || null,
      utm.utm_campaign || null,
      utm.utm_term || null,
      utm.utm_content || null,
      sm_platform,
      sm_user,
      device,
      browser,
      os,
      isBot,
      botScore,
    ];

    const { rows } = await query(sql, vals);
    const visitId = rows[0]?.id;
    // fire-and-forget webhook dispatch
    try { setImmediate(() => { dispatchWebhook('visit.created', { id: visitId, url, referrer, ip, user_agent: ua, device, browser, os, is_bot: isBot, bot_score: botScore }); }); } catch {}
    return res.status(200).json({ status: 'ok', visitId });
  } catch (e) {
    console.error('[analytics] visit error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /api/analytics/ingest/event
router.post('/event', async (req, res) => {
  try {
    const { visitId, type, payload } = req.body || {};
    if (!visitId || !type) return res.status(400).json({ error: 'missing_fields' });
    await query(
      'INSERT INTO events (visit_id, type, payload) VALUES ($1,$2,$3)'
      , [visitId, String(type), payload || {}]
    );
    try { setImmediate(() => { dispatchWebhook('event.created', { visit_id: visitId, type: String(type), payload: payload || {} }); }); } catch {}
    return res.status(200).json({ status: 'ok' });
  } catch (e) {
    console.error('[analytics] event error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /api/analytics/ingest/vitals
router.post('/vitals', async (req, res) => {
  try {
    const { visitId, lcp, fid, cls, ttfb, inp } = req.body || {};
    if (!visitId) return res.status(400).json({ error: 'missing_visitId' });
    await query(
      'INSERT INTO vitals (visit_id, lcp, fid, cls, ttfb, inp) VALUES ($1,$2,$3,$4,$5,$6)'
      , [visitId, lcp ?? null, fid ?? null, cls ?? null, ttfb ?? null, inp ?? null]
    );
    try { setImmediate(() => { dispatchWebhook('vitals.created', { visit_id: visitId, lcp, fid, cls, ttfb, inp }); }); } catch {}
    return res.status(200).json({ status: 'ok' });
  } catch (e) {
    console.error('[analytics] vitals error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
