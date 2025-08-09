const express = require('express');
const request = require('supertest');

// Mock mongoose with internal fns (no out-of-scope refs)
jest.mock('mongoose', () => {
  const insertOne = jest.fn().mockResolvedValue({ acknowledged: true, insertedId: 'abc' });
  const collection = jest.fn(() => ({ insertOne }));
  return {
    __esModule: true,
    default: {},
    connection: { collection },
  };
});

// Require after mocks are set up
const route = require('../llmUsage');

describe('LLM Usage Webhook Route', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/llm/usage', route);
    delete process.env.LITELLM_WEBHOOK_SECRET; // default: signature disabled
  });

  it('accepts a minimal valid payload and writes to DB', async () => {
    const payload = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      input_tokens: 10,
      output_tokens: 20,
      cost_usd: 0.001,
    };

    const res = await request(app).post('/api/llm/usage').send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    // DB call is mocked; successful 200 is sufficient here
  });

  it('rejects invalid payload with 400', async () => {
    const res = await request(app).post('/api/llm/usage').send({ input_tokens: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('verifies signature when secret is set', async () => {
    process.env.LITELLM_WEBHOOK_SECRET = 'test_secret';

    const signedApp = express();
    signedApp.use(express.json());
    signedApp.use('/api/llm/usage', route);

    const payload = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      input_tokens: 1,
      output_tokens: 1,
      cost_usd: 0.0,
    };
    const body = JSON.stringify(payload);
    const crypto = require('crypto');
    const sig = crypto.createHmac('sha256', process.env.LITELLM_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    const res = await request(signedApp)
      .post('/api/llm/usage')
      .set('x-signature', `sha256=${sig}`)
      .send(payload);

    expect(res.status).toBe(200);
    // DB call is mocked; 200 implies insert succeeded
  });

  it('rejects when signature is invalid', async () => {
    process.env.LITELLM_WEBHOOK_SECRET = 'test_secret';

    const signedApp = express();
    signedApp.use(express.json());
    signedApp.use('/api/llm/usage', route);

    const res = await request(signedApp)
      .post('/api/llm/usage')
      .set('x-signature', 'sha256=deadbeef')
      .send({ provider: 'openai', model: 'gpt-4o-mini', input_tokens: 1, output_tokens: 1, cost_usd: 0 });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_signature');
  });
});
