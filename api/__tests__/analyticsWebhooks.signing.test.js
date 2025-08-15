const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('~', path.resolve(__dirname, '..'));

const crypto = require('crypto');

// Freeze time for deterministic signature
const FIXED_TS = 1723333333; // arbitrary

// Mock DB load of webhooks
jest.mock('~/lib/pg', () => ({
  query: jest.fn(async (sql, params) => {
    const s = String(sql).toLowerCase();
    if (s.includes('from analytics_webhooks')) {
      return { rows: [{ id: 42, url: 'https://webhook.test/endpoint', event: 'event.created' }] };
    }
    return { rows: [] };
  }),
}));

// Capture axios.post calls via factory-scoped mock
jest.mock('axios', () => {
  const mockPost = jest.fn(() => Promise.resolve({ status: 200 }));
  const mod = { post: mockPost };
  return mod;
});

const axios = require('axios');
const { dispatchWebhook } = require('~/server/services/analyticsWebhooks');
const pg = require('~/lib/pg');

describe('Analytics Webhooks - HMAC signing', () => {
  const OLD_KEY = process.env.ANALYTICS_WEBHOOK_SIGNING_KEY;
  beforeEach(() => {
    axios.post.mockClear();
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_TS * 1000);
  });
  afterAll(() => {
    process.env.ANALYTICS_WEBHOOK_SIGNING_KEY = OLD_KEY;
    jest.spyOn(Date, 'now').mockRestore?.();
  });

  it('sends unsigned when no key set', async () => {
    delete process.env.ANALYTICS_WEBHOOK_SIGNING_KEY;
    await dispatchWebhook('event.created', { a: 1 });
    expect(pg.query).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledTimes(1);
    const args = axios.post.mock.calls[0];
    const headers = args[2].headers;
    expect(headers['X-Webhook-Signature']).toBeUndefined();
    expect(headers['X-Webhook-Timestamp']).toBeUndefined();
  });

  it('sends signed headers when key is set', async () => {
    process.env.ANALYTICS_WEBHOOK_SIGNING_KEY = 'test-secret';
    const payload = { a: 1 };
    await dispatchWebhook('event.created', payload);
    expect(pg.query).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = axios.post.mock.calls[0];
    expect(url).toBe('https://webhook.test/endpoint');
    expect(body).toEqual(payload);
    const headers = config.headers;
    expect(headers['X-Webhook-Timestamp']).toBe(String(FIXED_TS));
    expect(headers['X-Webhook-Signature-Alg']).toBe('sha256');

    const expected = crypto
      .createHmac('sha256', 'test-secret')
      .update(`${FIXED_TS}.event.created.42.${JSON.stringify(payload)}`)
      .digest('hex');
    expect(headers['X-Webhook-Signature']).toBe(expected);
  });
});
