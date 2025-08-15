const path = require('path');
const request = require('supertest');

function buildApp() {
  jest.resetModules();
  const moduleAlias = require('module-alias');
  moduleAlias.addAlias('~', path.resolve(__dirname, '..'));

  // Bypass auth/admin middleware
  jest.doMock('~/server/middleware', () => ({
    requireJwtAuth: (_req, _res, next) => next(),
    checkAdmin: (_req, _res, next) => next(),
  }));

  // Mock PG with internal state scoped per test
  jest.doMock('~/lib/pg', () => {
    let mockStore = [];
    let mockIdSeq = 1;
    return {
      query: jest.fn(async (sql, params) => {
        const s = String(sql).trim().toLowerCase();
        if (s.startsWith('select') && s.includes('from analytics_blocklist')) {
          return { rows: [...mockStore].sort((a, b) => b.created_at - a.created_at) };
        }
        if (s.startsWith('insert into analytics_blocklist')) {
          const [type, pattern, reason] = params;
          const row = { id: mockIdSeq++, type, pattern, reason, created_at: new Date() };
          mockStore.push(row);
          return { rows: [row] };
        }
        if (s.startsWith('delete from analytics_blocklist')) {
          const id = params[0];
          mockStore = mockStore.filter((r) => r.id !== Number(id));
          return { rows: [], rowCount: 1 };
        }
        if (s.includes('from analytics_settings')) {
          return { rows: [{ id: 1, retention_days: 365, bot_threshold: 70, allow_raw_ip: true, updated_at: new Date() }] };
        }
        return { rows: [] };
      }),
    };
  });

  const express = require('express');
  const adminRouter = require('~/server/routes/analyticsAdmin');
  const app = express();
  app.use(express.json());
  app.use('/api/analytics/admin', adminRouter);
  return app;
}

describe('Analytics Admin Blocklist CRUD', () => {
  let app;
  beforeEach(() => {
    app = buildApp();
  });

  it('creates and lists blocklist entries', async () => {
    const create = await request(app)
      .post('/api/analytics/admin/blocklist')
      .send({ type: 'ip', pattern: '10.0.0.1', reason: 'Test' });
    expect(create.status).toBe(201);
    expect(create.body.id).toBeDefined();

    const list = await request(app).get('/api/analytics/admin/blocklist');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
    expect(list.body[0].pattern).toBe('10.0.0.1');
  });

  it('deletes blocklist entry', async () => {
    const create = await request(app)
      .post('/api/analytics/admin/blocklist')
      .send({ type: 'referrer', pattern: 'spam.example' });
    const id = create.body.id;

    const del = await request(app).delete(`/api/analytics/admin/blocklist/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get('/api/analytics/admin/blocklist');
    expect(list.body.length).toBe(0);
  });
});
