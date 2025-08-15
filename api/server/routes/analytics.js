const express = require('express');
const { query } = require('~/lib/pg');

const router = express.Router();

// GET /api/analytics/overview?from=2025-01-01&to=2025-01-31
router.get('/overview', async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 7 * 864e5);
    const to = req.query.to ? new Date(req.query.to) : new Date();

    const visitsSql = `SELECT date_trunc('day', created_at) as d, count(*)::int as visits
      FROM visits WHERE created_at BETWEEN $1 AND $2 GROUP BY 1 ORDER BY 1`;
    const uniquesSql = `SELECT date_trunc('day', created_at) as d, count(DISTINCT ip)::int as uniques
      FROM visits WHERE created_at BETWEEN $1 AND $2 GROUP BY 1 ORDER BY 1`;
    const topPagesSql = `SELECT url, count(*)::int as c FROM visits
      WHERE created_at BETWEEN $1 AND $2 GROUP BY 1 ORDER BY c DESC LIMIT 10`;
    const utmSql = `SELECT coalesce(utm_source,'(none)') as source, count(*)::int as c FROM visits
      WHERE created_at BETWEEN $1 AND $2 GROUP BY 1 ORDER BY c DESC LIMIT 10`;
    const botsSql = `SELECT date_trunc('day', created_at) as d,
      sum(CASE WHEN is_bot THEN 1 ELSE 0 END)::int as bots,
      count(*)::int as total
      FROM visits WHERE created_at BETWEEN $1 AND $2 GROUP BY 1 ORDER BY 1`;

    const [visits, uniques, topPages, utm, bots] = await Promise.all([
      query(visitsSql, [from, to]).then(r => r.rows),
      query(uniquesSql, [from, to]).then(r => r.rows),
      query(topPagesSql, [from, to]).then(r => r.rows),
      query(utmSql, [from, to]).then(r => r.rows),
      query(botsSql, [from, to]).then(r => r.rows),
    ]);

    return res.status(200).json({ visits, uniques, topPages, utm, bots, from, to });
  } catch (e) {
    console.error('[analytics] overview error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
