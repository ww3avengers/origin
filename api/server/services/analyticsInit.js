const { query } = require('~/lib/pg');

/**
 * Initializes Postgres tables for analytics if they don't exist.
 * Raw IPs are stored as requested by the product owner.
 */
async function initAnalyticsSchema() {
  // visits
  await query(`
    CREATE TABLE IF NOT EXISTS visits (
      id BIGSERIAL PRIMARY KEY,
      session_id TEXT,
      visitor_id TEXT,
      ip TEXT, -- raw IP as requested
      user_agent TEXT,
      accept_lang TEXT,
      referrer TEXT,
      url TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_term TEXT,
      utm_content TEXT,
      sm_platform TEXT, -- detected social platform
      sm_user TEXT,     -- captured nickname/handle if present in query or referrer
      country TEXT,
      region TEXT,
      city TEXT,
      device TEXT,
      browser TEXT,
      os TEXT,
      is_bot BOOLEAN DEFAULT FALSE,
      bot_score INTEGER,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // Existing indexes for visits/events/vitals
  await query(`CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits (created_at)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_visits_is_bot ON visits (is_bot)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_visits_bot_score ON visits (bot_score)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_visits_user_agent ON visits (user_agent)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_visits_referrer ON visits (referrer)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_visits_url ON visits (url)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_events_ts ON events (ts)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_vitals_ts ON vitals (ts)`);

  // Admin Settings tables
  await query(`
    CREATE TABLE IF NOT EXISTS analytics_settings (
      id SMALLINT PRIMARY KEY DEFAULT 1,
      retention_days INTEGER DEFAULT 365,
      bot_threshold INTEGER DEFAULT 60,
      allow_raw_ip BOOLEAN DEFAULT true,
      updated_at TIMESTAMPTZ DEFAULT now()
    )`);
  // Ensure single row exists
  await query(`INSERT INTO analytics_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);

  await query(`
    CREATE TABLE IF NOT EXISTS analytics_blocklist (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('ip','user_agent','referrer')),
      pattern TEXT NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )`);

  await query(`
    CREATE TABLE IF NOT EXISTS analytics_webhooks (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      event TEXT NOT NULL,
      secret_hash TEXT,
      is_enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    )`);

  await query(`
    CREATE TABLE IF NOT EXISTS analytics_api_keys (
      id SERIAL PRIMARY KEY,
      key_hash TEXT NOT NULL,
      label TEXT,
      scope TEXT DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT now(),
      revoked_at TIMESTAMPTZ
    )`);
  await query(`CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON analytics_api_keys (key_hash)`);

  // events
  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      visit_id BIGINT REFERENCES visits(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      payload JSONB,
      ts TIMESTAMPTZ DEFAULT now()
    );
  `);

  // vitals
  await query(`
    CREATE TABLE IF NOT EXISTS vitals (
      id BIGSERIAL PRIMARY KEY,
      visit_id BIGINT REFERENCES visits(id) ON DELETE CASCADE,
      lcp DOUBLE PRECISION,
      fid DOUBLE PRECISION,
      cls DOUBLE PRECISION,
      ttfb DOUBLE PRECISION,
      inp DOUBLE PRECISION,
      ts TIMESTAMPTZ DEFAULT now()
    );
  `);
}

module.exports = { initAnalyticsSchema };
