const { query } = require('~/lib/pg');

async function getRetentionDays() {
  try {
    const { rows } = await query('SELECT retention_days FROM analytics_settings WHERE id = 1');
    const days = rows?.[0]?.retention_days;
    return Number.isFinite(days) && days > 0 ? Number(days) : 365;
  } catch (e) {
    console.warn('[analytics] retention_days read failed, default 365', e);
    return 365;
  }
}

async function purgeOldData() {
  const days = await getRetentionDays();
  // safety clamp 1..3650 (~10y)
  const safeDays = Math.min(Math.max(days, 1), 3650);
  try {
    const { rows } = await query('SELECT now() - ($1 || \n' +
      "' days')::interval AS cutoff", [safeDays]);
    const cutoff = rows?.[0]?.cutoff;

    // Delete child tables first to avoid FK issues
    await query(
      `DELETE FROM events WHERE visit_id IN (SELECT id FROM visits WHERE created_at < $1)`,
      [cutoff]
    );
    await query(
      `DELETE FROM vitals WHERE visit_id IN (SELECT id FROM visits WHERE created_at < $1)`,
      [cutoff]
    );
    const result = await query(
      `DELETE FROM visits WHERE created_at < $1`,
      [cutoff]
    );

    console.info('[analytics] retention purge completed', { days: safeDays, deletedVisits: result.rowCount });
  } catch (e) {
    console.error('[analytics] retention purge failed', e);
  }
}

function startAnalyticsRetentionJob() {
  // Stagger start to avoid blocking server boot
  const initialDelayMs = 30_000; // 30s after boot
  const intervalMs = 6 * 60 * 60 * 1000; // every 6 hours

  setTimeout(() => {
    purgeOldData();
    setInterval(purgeOldData, intervalMs);
  }, initialDelayMs);

  console.info('[analytics] retention job scheduled');
}

module.exports = {
  startAnalyticsRetentionJob,
  purgeOldData,
};
