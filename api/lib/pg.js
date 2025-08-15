// Lightweight Postgres client for Analytics
// Uses PG connection string from process.env.ANALYTICS_PG_URL or individual vars

const { Pool } = require('pg');

const cn = process.env.ANALYTICS_PG_URL || null;

const pool = new Pool(
  cn
    ? { connectionString: cn, max: 10, idleTimeoutMillis: 30000 }
    : {
        host: process.env.ANALYTICS_PG_HOST || '127.0.0.1',
        port: parseInt(process.env.ANALYTICS_PG_PORT || '5432', 10),
        user: process.env.ANALYTICS_PG_USER || 'postgres',
        password: process.env.ANALYTICS_PG_PASSWORD || '',
        database: process.env.ANALYTICS_PG_DATABASE || 'analytics',
        max: 10,
        idleTimeoutMillis: 30000,
      }
);

pool.on('error', (err) => {
  // Avoid crashing on idle client errors
  console.error('[analytics-pg] Unexpected error on idle client', err);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 200) {
    console.warn('[analytics-pg] slow query', { duration, text });
  }
  return res;
}

async function getClient() {
  return await pool.connect();
}

module.exports = { pool, query, getClient };
