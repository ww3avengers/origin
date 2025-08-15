const { query } = require('~/lib/pg');

async function ensureMaterializedViews() {
  try {
    // Daily visits (bot/human split)
    await query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_visits AS
      SELECT
        date_trunc('day', created_at)::date AS day,
        COUNT(*)::bigint AS visits,
        SUM(CASE WHEN is_bot THEN 1 ELSE 0 END)::bigint AS bot_visits,
        SUM(CASE WHEN NOT is_bot THEN 1 ELSE 0 END)::bigint AS human_visits
      FROM visits
      GROUP BY 1
      ORDER BY 1;
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_mv_daily_visits_day ON mv_daily_visits (day)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_daily_visits_day ON mv_daily_visits (day)`);

    // Event counts per day and type
    await query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_event_counts AS
      SELECT
        date_trunc('day', ts)::date AS day,
        type,
        COUNT(*)::bigint AS cnt
      FROM events
      GROUP BY 1,2
      ORDER BY 1,2;
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_mv_event_counts_day_type ON mv_event_counts (day, type)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_event_counts_day_type ON mv_event_counts (day, type)`);

    // MAS -> FAQ funnel (faq_hash_open with payload.id = 'mas')
    await query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_funnel_mas_to_faq AS
      WITH faq AS (
        SELECT date_trunc('day', e.ts)::date AS day, COUNT(*)::bigint AS faq_mas
        FROM events e
        WHERE e.type = 'faq_hash_open'
          AND (e.payload->>'id') = 'mas'
        GROUP BY 1
      ), visits_daily AS (
        SELECT date_trunc('day', v.created_at)::date AS day, COUNT(*)::bigint AS visits
        FROM visits v
        GROUP BY 1
      )
      SELECT v.day,
             v.visits,
             COALESCE(f.faq_mas, 0)::bigint AS faq_mas,
             CASE WHEN v.visits > 0 THEN ROUND((COALESCE(f.faq_mas,0)::numeric / v.visits::numeric)*100, 2) ELSE 0 END AS conv_rate_pct
      FROM visits_daily v
      LEFT JOIN faq f ON f.day = v.day
      ORDER BY 1;
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_mv_funnel_mas_to_faq_day ON mv_funnel_mas_to_faq (day)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_funnel_mas_to_faq_day ON mv_funnel_mas_to_faq (day)`);

    // Social referrals (platform/user per day)
    await query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_referrals_social AS
      SELECT
        date_trunc('day', created_at)::date AS day,
        COALESCE(sm_platform, 'unknown') AS platform,
        COALESCE(sm_user, 'unknown') AS sm_user,
        COUNT(*)::bigint AS visits
      FROM visits
      WHERE sm_platform IS NOT NULL OR sm_user IS NOT NULL OR referrer IS NOT NULL
      GROUP BY 1,2,3
      ORDER BY 1,2,3;
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_mv_referrals_social_day ON mv_referrals_social (day)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS uidx_mv_referrals_social_day_plat_user ON mv_referrals_social (day, platform, sm_user)`);

    // Make refresh fast on initial empty MVs
    await refreshAllMaterializedViews();

    console.info('[analytics] materialized views ensured & refreshed');
  } catch (e) {
    console.warn('[analytics] ensure materialized views failed', e);
  }
}

async function refreshMaterializedView(name) {
  const allowed = new Set([
    'mv_daily_visits',
    'mv_event_counts',
    'mv_funnel_mas_to_faq',
    'mv_referrals_social',
  ]);
  if (!allowed.has(name)) throw new Error('unknown_view');
  try {
    await query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${name}`);
  } catch (e) {
    await query(`REFRESH MATERIALIZED VIEW ${name}`);
  }
}

async function refreshAllMaterializedViews() {
  // Use non-concurrent if indexes are not present yet, fallback to non-concurrent on error
  try {
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_visits');
  } catch { await query('REFRESH MATERIALIZED VIEW mv_daily_visits'); }
  try {
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_event_counts');
  } catch { await query('REFRESH MATERIALIZED VIEW mv_event_counts'); }
  try {
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_funnel_mas_to_faq');
  } catch { await query('REFRESH MATERIALIZED VIEW mv_funnel_mas_to_faq'); }
  try {
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_referrals_social');
  } catch { await query('REFRESH MATERIALIZED VIEW mv_referrals_social'); }
}

module.exports = {
  ensureMaterializedViews,
  refreshMaterializedView,
  refreshAllMaterializedViews,
};
