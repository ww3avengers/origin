const express = require('express');
const crypto = require('crypto');
const { logger } = require('@librechat/data-schemas');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * Lightweight validator to guard expected shape.
 * LiteLLM can be configured to send fields like:
 * { tenant_id, user_id, provider, model, input_tokens, output_tokens, cost_usd, latency_ms, timestamp, request_id }
 */
function validateUsage(body) {
  const errors = [];
  const num = (v) => (typeof v === 'number' && isFinite(v)) || v === undefined;
  const str = (v) => typeof v === 'string' || v === undefined;

  if (!str(body.tenant_id)) errors.push('tenant_id must be string');
  if (!str(body.user_id)) errors.push('user_id must be string');
  if (!str(body.provider)) errors.push('provider must be string');
  if (!str(body.model)) errors.push('model must be string');
  if (!num(body.input_tokens)) errors.push('input_tokens must be number');
  if (!num(body.output_tokens)) errors.push('output_tokens must be number');
  if (!num(body.cost_usd)) errors.push('cost_usd must be number');
  if (!num(body.latency_ms)) errors.push('latency_ms must be number');
  if (!str(body.request_id)) errors.push('request_id must be string');
  if (body.timestamp && isNaN(Date.parse(body.timestamp))) errors.push('timestamp invalid');

  return { ok: errors.length === 0, errors };
}

function verifySignature(req) {
  const secret = process.env.LITELLM_WEBHOOK_SECRET;
  if (!secret) return true; // signature optional

  const sig = req.headers['x-signature'] || req.headers['x-hub-signature'] || '';
  if (!sig) return false;

  try {
    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    // Allow formats like `sha256=...` or raw hex
    const normalized = sig.startsWith('sha256=') ? sig.slice(7) : sig;
    const a = Buffer.from(hmac);
    const b = Buffer.from(normalized);
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    logger.warn('[llm-usage] signature verify error', e);
    return false;
  }
}

router.post('/', async (req, res) => {
  try {
    if (!verifySignature(req)) {
      return res.status(401).json({ error: 'invalid_signature' });
    }

    const { ok, errors } = validateUsage(req.body || {});
    if (!ok) {
      return res.status(400).json({ error: 'invalid_payload', details: errors });
    }

    const now = new Date();
    const doc = {
      tenant_id: req.body.tenant_id ?? null,
      user_id: req.body.user_id ?? null,
      provider: req.body.provider ?? null,
      model: req.body.model ?? null,
      input_tokens: req.body.input_tokens ?? 0,
      output_tokens: req.body.output_tokens ?? 0,
      cost_usd: req.body.cost_usd ?? 0,
      latency_ms: req.body.latency_ms ?? null,
      request_id: req.body.request_id ?? null,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : now,
      received_at: now,
      meta: req.body.meta ?? {},
    };

    const collection = mongoose.connection.collection('usage_logs');
    await collection.insertOne(doc);

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    logger.error('[llm-usage] failed to store usage log', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
