const express = require('express');
const { query } = require('~/lib/pg');
const checkAdmin = require('../middleware/roles/admin');

const router = express.Router();

// GET /api/analytics/bots/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/overview', checkAdmin, async (req, res) => {
  try {
    // Validate and normalize dates (UTC, half-open interval [from, toExclusive))
    const isoDateRe = /^\d{4}-\d{2}-\d{2}$/;
    const todayLocal = new Date();
    const defaultFromLocal = new Date(todayLocal.getTime() - 7 * 864e5);

    const parseISODateUTC = (s) => {
      if (!isoDateRe.test(s)) return null;
      const [y, m, d] = s.split('-').map((x) => parseInt(x, 10));
      return new Date(Date.UTC(y, m - 1, d));
    };

    const fromDate = req.query.from ? parseISODateUTC(req.query.from) : new Date(Date.UTC(defaultFromLocal.getUTCFullYear(), defaultFromLocal.getUTCMonth(), defaultFromLocal.getUTCDate()));
    const toDate = req.query.to ? parseISODateUTC(req.query.to) : new Date(Date.UTC(todayLocal.getUTCFullYear(), todayLocal.getUTCMonth(), todayLocal.getUTCDate()));

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'invalid_date_format', message: 'Use YYYY-MM-DD' });
    }
    if (fromDate > toDate) {
      return res.status(400).json({ error: 'invalid_range', message: '`from` must be <= `to`' });
    }

    // half-open interval end (exclusive): to + 1 day
    const toExclusive = new Date(toDate.getTime() + 864e5);

    const timeseriesSql = `
      WITH series AS (
        SELECT gs::date AS d
        FROM generate_series($1::date, $2::date, interval '1 day') AS gs
      )
      SELECT s.d,
             COALESCE(SUM(CASE WHEN v.is_bot THEN 1 ELSE 0 END), 0)::int AS bots,
             COALESCE(COUNT(v.*), 0)::int AS total
      FROM series s
      LEFT JOIN visits v
        ON v.created_at >= s.d::timestamptz
       AND v.created_at < (s.d + interval '1 day')::timestamptz
      GROUP BY s.d
      ORDER BY s.d`;

    const scoreHistSql = `
      SELECT width_bucket(coalesce(bot_score, 0), 0, 100, 5) AS bucket,
             concat((width_bucket(coalesce(bot_score, 0), 0, 100, 5) - 1) * 20, '-', width_bucket(coalesce(bot_score, 0), 0, 100, 5) * 20) AS range,
             count(*)::int AS c
      FROM visits
      WHERE created_at >= $1 AND created_at < $2 AND bot_score IS NOT NULL
      GROUP BY 1,2
      ORDER BY 1`;

    const topUaSql = `
      SELECT user_agent, count(*)::int AS c
      FROM visits
      WHERE created_at >= $1 AND created_at < $2 AND is_bot = true AND user_agent IS NOT NULL
      GROUP BY 1
      ORDER BY c DESC
      LIMIT 10`;

    const topRefSql = `
      SELECT coalesce(referrer,'(direct)') AS referrer, count(*)::int AS c
      FROM visits
      WHERE created_at >= $1 AND created_at < $2 AND is_bot = true
      GROUP BY 1
      ORDER BY c DESC
      LIMIT 10`;

    const recentSql = `
      SELECT id, ip, user_agent, url, referrer, bot_score, created_at
      FROM visits
      WHERE created_at >= $1 AND created_at < $2 AND is_bot = true
      ORDER BY created_at DESC
      LIMIT 20`;

    const [timeseries, score_hist, top_user_agents, top_referrers, recent] = await Promise.all([
      query(timeseriesSql, [fromDate, toDate]).then((r) => r.rows),
      query(scoreHistSql, [fromDate, toExclusive]).then((r) => r.rows),
      query(topUaSql, [fromDate, toExclusive]).then((r) => r.rows),
      query(topRefSql, [fromDate, toExclusive]).then((r) => r.rows),
      query(recentSql, [fromDate, toExclusive]).then((r) => r.rows),
    ]);

    return res.status(200).json({
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
      timeseries,
      score_hist,
      top_user_agents,
      top_referrers,
      recent,
    });
  } catch (e) {
    console.error('[analytics] bots overview error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
