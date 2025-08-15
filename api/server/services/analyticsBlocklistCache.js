const { query } = require('~/lib/pg');

let cache = { items: [], fetchedAt: 0 };
const TTL_MS = 60 * 1000; // 60s

async function fetchFromDb() {
  const { rows } = await query('SELECT type, pattern FROM analytics_blocklist');
  return rows || [];
}

async function getBlocklist(force = false) {
  const now = Date.now();
  if (!force && cache.items.length && now - cache.fetchedAt < TTL_MS) {
    return cache.items;
  }
  try {
    const items = await fetchFromDb();
    cache = { items, fetchedAt: Date.now() };
    return items;
  } catch (e) {
    console.error('[analytics] blocklist cache refresh failed', e);
    // return stale if available
    return cache.items || [];
  }
}

function invalidateBlocklist() {
  cache.fetchedAt = 0;
}

module.exports = {
  getBlocklist,
  invalidateBlocklist,
};
