const express = require('express');
const { query } = require('~/lib/pg');
const { requireJwtAuth, checkAdmin } = require('~/server/middleware');

const router = express.Router();
router.use(requireJwtAuth, checkAdmin);

function parseDateRange(req) {
  const { from, to } = req.query || {};
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  // clamp to date boundaries
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return { startDate, endDate };
}

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = parseDateRange(req);
    const fromISO = startDate.toISOString();
    const toISO = endDate.toISOString();

    const [dailyRes, uniquesRes, topPagesRes, utmRes] = await Promise.all([
      query(
        `SELECT day::text, visits, bot_visits, human_visits
         FROM mv_daily_visits
         WHERE day >= $1::date AND day <= $2::date
         ORDER BY day ASC`,
        [fromISO, toISO]
      ),
      query(
        `SELECT date_trunc('day', created_at)::date AS d, COUNT(DISTINCT visitor_id)::bigint AS uniques
         FROM visits
         WHERE created_at >= $1::timestamp AND created_at < ($2::timestamp + interval '1 day')
         GROUP BY 1
         ORDER BY 1`,
        [fromISO, toISO]
      ),
      query(
        `SELECT url, COUNT(*)::bigint AS c
         FROM visits
         WHERE created_at >= $1::timestamp AND created_at < ($2::timestamp + interval '1 day')
         GROUP BY 1
         ORDER BY c DESC
         LIMIT 10`,
        [fromISO, toISO]
      ),
      query(
        `SELECT COALESCE(utm_source,'(none)') AS source, COUNT(*)::bigint AS c
         FROM visits
         WHERE created_at >= $1::timestamp AND created_at < ($2::timestamp + interval '1 day')
         GROUP BY 1
         ORDER BY c DESC
         LIMIT 10`,
        [fromISO, toISO]
      ),
    ]);

    const visits = dailyRes.rows.map((r) => ({ d: r.day, visits: Number(r.human_visits) }));
    const bots = dailyRes.rows.map((r) => ({ d: r.day, bots: Number(r.bot_visits), total: Number(r.visits) }));
    const uniques = uniquesRes.rows.map((r) => ({ d: String(r.d), uniques: Number(r.uniques) }));
    const topPages = topPagesRes.rows.map((r) => ({ url: r.url, c: Number(r.c) }));
    const utm = utmRes.rows.map((r) => ({ source: r.source, c: Number(r.c) }));

    return res.status(200).json({ visits, uniques, topPages, utm, bots, from: fromISO, to: toISO });
  } catch (e) {
    console.error('[analytics-overview] error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
