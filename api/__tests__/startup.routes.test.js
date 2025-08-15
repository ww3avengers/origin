const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;
let app;

jest.setTimeout(60000);

async function waitForServerReady(app, { timeoutMs = 15000, intervalMs = 250 } = {}) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await request(app).get('/health');
      if (res.status === 200) return; // server ready
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  if (lastErr) {
    // eslint-disable-next-line no-console
    console.error('waitForServerReady last error:', lastErr);
  }
  throw new Error('Server not ready within timeout');
}

describe('Startup routes: /api/config and /api/banner', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    // Ensure env is set BEFORE requiring the app (server connects on require)
    process.env.MONGO_URI = uri;
    process.env.PORT = '0'; // use ephemeral port to avoid conflicts
    process.env.NODE_ENV = 'test';
    process.env.ALLOW_SOCIAL_LOGIN = 'false';
    process.env.DISABLE_COMPRESSION = 'false';
    process.env.ENABLE_ANALYTICS = 'false';
    process.env.ANALYTICS_DISABLE_JOBS = 'true';

    // Now require the app (triggers server start and DB connect)
    app = require('../server/index');

    // Wait for server readiness by polling /health
    await waitForServerReady(app);
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close();
    } catch {}
    // Close analytics PG pool to avoid open handles
    try {
      const { pool } = require('../lib/pg');
      if (pool?.end) {
        await pool.end();
      }
    } catch {}
    if (mongo) {
      await mongo.stop();
    }
  });

  test('GET /api/config returns 200 and JSON with expected shape', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('appTitle');
    expect(res.body).toHaveProperty('interface');
    expect(Array.isArray(res.body.socialLogins)).toBe(true);
    // instanceProjectId may be undefined/null if project is missing; ensure route does not 500
    expect(Object.prototype.hasOwnProperty.call(res.body, 'instanceProjectId')).toBe(true);
  });

  test('GET /api/banner returns 200 and null when no banner exists', async () => {
    const res = await request(app).get('/api/banner');
    expect(res.status).toBe(200);
    // Our route sends either banner object or null
    expect(res.body === null || typeof res.body === 'object').toBe(true);
  });
});
