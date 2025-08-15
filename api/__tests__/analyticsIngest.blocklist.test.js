const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('~', path.resolve(__dirname, '..'));

const express = require('express');
const request = require('supertest');

// Mock PG query
jest.mock('~/lib/pg', () => ({
  query: jest.fn(async () => ({ rows: [{ id: 123 }] })),
}));

// Mock blocklist cache to control responses
jest.mock('~/server/services/analyticsBlocklistCache', () => ({
  getBlocklist: jest.fn(async () => [
    { type: 'ip', pattern: '1.2.3.4' },
    { type: 'user_agent', pattern: '/curl/i' },
    { type: 'referrer', pattern: 'spam.example' },
  ]),
}));

// Mock webhooks dispatch to avoid network
jest.mock('~/server/services/analyticsWebhooks', () => ({
  dispatchWebhook: jest.fn(() => Promise.resolve()),
}));

const ingestRouter = require('~/server/routes/analyticsIngest');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/analytics/ingest', ingestRouter);
  return app;
}

describe('Analytics Ingest Blocklist', () => {
  const app = makeApp();

  it('blocks by IP with 202', async () => {
    const res = await request(app)
      .post('/api/analytics/ingest/visit')
      .set('x-forwarded-for', '1.2.3.4')
      .set('user-agent', 'Mozilla/5.0')
      .send({ url: 'https://example.com', referrer: '' });
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ status: 'blocked' });
  });

  it('blocks by user-agent regex', async () => {
    const res = await request(app)
      .post('/api/analytics/ingest/visit')
      .set('user-agent', 'curl/8.0.0')
      .send({ url: 'https://example.com', referrer: '' });
    expect(res.status).toBe(202);
  });

  it('blocks by referrer substring', async () => {
    const res = await request(app)
      .post('/api/analytics/ingest/visit')
      .set('user-agent', 'Mozilla/5.0')
      .send({ url: 'https://example.com', referrer: 'https://spam.example/page' });
    expect(res.status).toBe(202);
  });

  it('allows when no block matched', async () => {
    const res = await request(app)
      .post('/api/analytics/ingest/visit')
      .set('user-agent', 'Mozilla/5.0')
      .set('x-forwarded-for', '9.9.9.9')
      .send({ url: 'https://example.com', referrer: 'https://good.example/' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.visitId).toBeDefined();
  });
});
