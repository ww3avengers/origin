const axios = require('axios');
const crypto = require('crypto');
const { query } = require('~/lib/pg');

/**
 * Load enabled webhooks for a given event name
 * @param {string} eventName
 */
async function loadWebhooks(eventName) {
  try {
    const { rows } = await query(
      'SELECT id, url, event FROM analytics_webhooks WHERE is_enabled = true AND event = $1',
      [String(eventName)]
    );
    return rows || [];
  } catch (e) {
    console.error('[analytics] load webhooks failed', e);
    return [];
  }
}

/**
 * Build optional HMAC headers if a global signing key is present.
 * Signature format: sha256 HMAC over `${ts}.${eventName}.${hookId}.${json}` in hex.
 * Headers: X-Webhook-Signature, X-Webhook-Signature-Alg, X-Webhook-Timestamp
 */
function buildSigningHeaders(eventName, hookId, payload) {
  const key = process.env.ANALYTICS_WEBHOOK_SIGNING_KEY;
  if (!key) return {};
  const ts = Math.floor(Date.now() / 1000);
  const body = JSON.stringify(payload ?? {});
  const msg = `${ts}.${eventName}.${hookId}.${body}`;
  const h = crypto.createHmac('sha256', key).update(msg).digest('hex');
  return {
    'X-Webhook-Timestamp': String(ts),
    'X-Webhook-Signature': h,
    'X-Webhook-Signature-Alg': 'sha256',
  };
}

/**
 * Dispatch payload to all enabled webhooks for the event.
 * @param {string} eventName
 * @param {object} payload
 */
async function dispatchWebhook(eventName, payload) {
  const hooks = await loadWebhooks(eventName);
  if (!hooks.length) return;

  const attempts = 3;
  const baseDelay = 1000; // 1s

  await Promise.all(
    hooks.map(async (h) => {
      for (let i = 1; i <= attempts; i++) {
        try {
          const signingHeaders = buildSigningHeaders(eventName, h.id, payload);
          await axios.post(h.url, payload, {
            timeout: 8000,
            headers: {
              'Content-Type': 'application/json',
              'X-Analytics-Event': eventName,
              'X-Webhook-Id': String(h.id),
              ...signingHeaders,
            },
          });
          return; // success, stop retrying this hook
        } catch (e) {
          const wait = baseDelay * Math.pow(2, i - 1);
          if (i === attempts) {
            console.warn('[analytics] webhook dispatch failed', { hookId: h.id, eventName, error: e?.message });
            break;
          }
          await new Promise((r) => setTimeout(r, wait));
        }
      }
    })
  );
}

module.exports = { dispatchWebhook };
