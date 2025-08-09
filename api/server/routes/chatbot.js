const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { logger } = require('@librechat/data-schemas');

// Optional: OpenAI (oder kompatible) Nutzung, wenn Key vorhanden
let OpenAI = null;
try {
  OpenAI = require('openai');
} catch (_) {}

const router = express.Router();

function demoReplyFrom(last) {
  return (
    'Hi! Ich bin der LibreChat Berater. (Demo-Antwort ohne Modell)\n' +
    `Du fragtest: "${(last || '').slice(0, 200)}". Mehr Infos auf unserer Produktseite.\n` +
    'Buche gern eine Demo – ich helfe beim Setup in 2 Minuten.'
  );
}

// Öffentlich zugänglich, aber gedrosselt
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: Number(process.env.CHATBOT_RPM || 30),
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(limiter);

const MessageSchema = z.object({ role: z.enum(['system', 'user', 'assistant']), content: z.string().min(1) });
const PayloadSchema = z.object({
  messages: z.array(MessageSchema).min(1),
  model: z.string().optional(),
  persona: z.string().optional(),
  pagePath: z.string().optional(),
  language: z.string().optional(),
});

router.post('/', async (req, res) => {
  try {
    const parse = PayloadSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parse.error.flatten() });
    }

    const { messages, model, persona, pagePath, language } = parse.data;

    const sysPrompt = [
      {
        role: 'system',
        content:
          `Du bist ein hilfreicher Verkaufsberater für LibreChat. Antworte kurz, klar und konversionsstark. ` +
          `Wenn sinnvoll, schlage eine Demo vor. Sprich die Sprache des Nutzers (language=${language || 'auto'}). ` +
          `Sei ehrlich über Limitierungen. Aktuelle Seite: ${pagePath || '/'}; Persona: ${persona || 'sales-advisor'}.`,
      },
    ];

    const finalMessages = [...sysPrompt, ...messages];

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_COMPAT;
    const useOpenAI = !!(OpenAI && apiKey);

    // Streaming bevorzugt, wenn clientseitig erwartet
    const wantsStream = (req.headers['accept'] || '').includes('text/event-stream') ||
      (req.headers['x-accept-stream'] || '').toString() === '1';

    if (!useOpenAI) {
      // Fallback: einfache, nicht-streamende Antwort (Demo)
      const last = messages[messages.length - 1]?.content || '';
      return res.status(200).json({ content: demoReplyFrom(last) });
    }

    const openai = new OpenAI({ apiKey });
    const modelName = model || process.env.CHATBOT_MODEL || 'gpt-4o-mini';

    if (wantsStream) {
      // NDJSON-Streaming
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Transfer-Encoding', 'chunked');

      try {
        const stream = await openai.chat.completions.create({
          model: modelName,
          messages: finalMessages,
          stream: true,
          temperature: 0.7,
        });

        for await (const chunk of stream) {
          const delta = chunk?.choices?.[0]?.delta?.content || '';
          if (delta) {
            res.write(JSON.stringify({ content: delta }) + '\n');
          }
        }
        res.write(JSON.stringify({ done: true }) + '\n');
        res.end();
      } catch (err) {
        logger.error('Chatbot stream error:', err);
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/x-ndjson');
          res.write(JSON.stringify({ content: demoReplyFrom(messages[messages.length - 1]?.content) }) + '\n');
          res.write(JSON.stringify({ done: true }) + '\n');
          res.end();
        } else {
          try {
            res.write(JSON.stringify({ content: '\n[Hinweis] Wechsle in Demo-Antwort.' }) + '\n');
            res.write(JSON.stringify({ done: true }) + '\n');
            res.end();
          } catch (_) {
            // ignore
          }
        }
      }
      return;
    }

    // Non-streaming
    try {
      const completion = await openai.chat.completions.create({
        model: modelName,
        messages: finalMessages,
        temperature: 0.7,
      });

      const text = completion?.choices?.[0]?.message?.content?.trim() || '';
      return res.status(200).json({ content: text });
    } catch (err) {
      logger.error('Chatbot non-stream error:', err);
      const last = messages[messages.length - 1]?.content || '';
      return res.status(200).json({ content: demoReplyFrom(last) });
    }
  } catch (error) {
    logger.error('Chatbot route error:', error);
    const last = Array.isArray(req.body?.messages)
      ? req.body.messages[req.body.messages.length - 1]?.content
      : '';
    return res.status(200).json({ content: demoReplyFrom(last) });
  }
});

module.exports = router;
