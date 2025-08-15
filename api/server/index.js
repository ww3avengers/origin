require('dotenv').config();
const fs = require('fs');
const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, '..') });
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const passport = require('passport');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { isEnabled } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const mongoSanitize = require('express-mongo-sanitize');
const { connectDb, indexSync } = require('~/db');

const validateImageRequest = require('./middleware/validateImageRequest');
const { jwtLogin, ldapLogin, passportLogin } = require('~/strategies');
const errorController = require('./controllers/ErrorController');
const initializeMCPs = require('./services/initializeMCPs');
const configureSocialLogins = require('./socialLogins');
const AppService = require('./services/AppService');
const staticCache = require('./utils/staticCache');
const noIndex = require('./middleware/noIndex');
const routes = require('./routes');
const { initAnalyticsSchema } = require('./services/analyticsInit');
const { startAnalyticsRetentionJob } = require('./services/analyticsRetention');
const { ensureMaterializedViews, refreshAllMaterializedViews } = require('./services/analyticsViews');

const { PORT, HOST, ALLOW_SOCIAL_LOGIN, DISABLE_COMPRESSION, TRUST_PROXY } = process.env ?? {};

// Allow PORT=0 to be used for automatic free port assignment
const port = isNaN(Number(PORT)) ? 3080 : Number(PORT);
const host = HOST || 'localhost';
const trusted_proxy = Number(TRUST_PROXY) || 1; /* trust first proxy by default */

const app = express();

const startServer = async () => {
  if (typeof Bun !== 'undefined') {
    axios.defaults.headers.common['Accept-Encoding'] = 'gzip';
  }
  await connectDb();

  logger.info('Connected to MongoDB');
  // Initialize Postgres schema for analytics (non-blocking errors will bubble to logs)
  try { await initAnalyticsSchema(); } catch (e) { console.warn('[analytics] init failed', e); }
  // Ensure materialized views exist (non-blocking)
  try { await ensureMaterializedViews(); } catch (e) { console.warn('[analytics] ensure views failed', e); }
  // Allow disabling background analytics jobs explicitly
  const analyticsDisabled = process.env.NODE_ENV === 'test' || process.env.ANALYTICS_DISABLE_JOBS === 'true';
  // schedule retention job (non-blocking)
  if (!analyticsDisabled) {
    try { startAnalyticsRetentionJob(); } catch (e) { console.warn('[analytics] retention job failed to schedule', e); }
  }
  // periodic MV refresh every 15 minutes (non-blocking)
  if (!analyticsDisabled) {
    try {
      setInterval(() => {
        refreshAllMaterializedViews().catch((err) => console.warn('[analytics] mv refresh failed', err));
      }, 15 * 60 * 1000);
    } catch (e) { console.warn('[analytics] schedule mv refresh failed', e); }
  }
  indexSync().catch((err) => {
    logger.error('[indexSync] Background sync failed:', err);
  });

  app.disable('x-powered-by');
  app.set('trust proxy', trusted_proxy);

  await AppService(app);

  const indexPath = path.join(app.locals.paths.dist, 'index.html');
  let indexHTML;
  try {
    indexHTML = fs.readFileSync(indexPath, 'utf8');
  } catch (e) {
    console.warn(
      `[server] index.html not found at ${indexPath}. Serving minimal placeholder.`,
      e?.message || e,
    );
    indexHTML =
      '<!doctype html><html lang="en-US"><head><meta charset="utf-8"><title>LibreChat API</title></head><body><h1>LibreChat API</h1><p>Client build not found. API is running.</p></body></html>';
  }

  app.get('/health', (_req, res) => res.status(200).send('OK'));

  /* Middleware */
  // Rate limiting (configurable via env)
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const maxRequests = Number(process.env.RATE_LIMIT_MAX || 600); // 600 reqs / 15min per IP (~40 rpm)
  const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 60); // stricter for auth endpoints

  const generalLimiter = rateLimit({ windowMs, max: maxRequests, standardHeaders: true, legacyHeaders: false });
  const authLimiter = rateLimit({ windowMs, max: authMax, standardHeaders: true, legacyHeaders: false });

  // Apply general limiter early for all routes
  app.use(generalLimiter);
  // Security headers (CSP in report-only to start safe)
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      reportOnly: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.googletagmanager.com'],
        "style-src": ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        "img-src": ["'self'", 'data:', 'blob:'],
        "font-src": ["'self'", 'data:', 'https://fonts.gstatic.com'],
        "connect-src": ["'self'", 'https:', 'http://localhost:*'],
        "frame-ancestors": ["'self'"],
        "object-src": ["'none'"],
      },
    }),
  );
  app.use(noIndex);
  app.use(express.json({ limit: '3mb' }));
  app.use(express.urlencoded({ extended: true, limit: '3mb' }));
  app.use(mongoSanitize());
  app.use(cors());
  app.use(cookieParser());

  if (!isEnabled(DISABLE_COMPRESSION)) {
    app.use(compression());
  } else {
    console.warn('Response compression has been disabled via DISABLE_COMPRESSION.');
  }

  // Serve static assets with aggressive caching
  app.use(staticCache(app.locals.paths.dist));
  app.use(staticCache(app.locals.paths.fonts));
  app.use(staticCache(app.locals.paths.assets));

  if (!ALLOW_SOCIAL_LOGIN) {
    console.warn('Social logins are disabled. Set ALLOW_SOCIAL_LOGIN=true to enable them.');
  }

  /* OAUTH */
  app.use(passport.initialize());
  passport.use(jwtLogin());
  passport.use(passportLogin());

  /* LDAP Auth */
  if (process.env.LDAP_URL && process.env.LDAP_USER_SEARCH_BASE) {
    passport.use(ldapLogin);
  }

  if (isEnabled(ALLOW_SOCIAL_LOGIN)) {
    await configureSocialLogins(app);
  }

  app.use('/oauth', routes.oauth);
  /* API Endpoints */
  // Apply stricter limiter specifically to auth endpoints
  app.use('/api/auth', authLimiter, routes.auth);
  app.use('/api/actions', routes.actions);
  app.use('/api/keys', routes.keys);
  app.use('/api/user', routes.user);
  app.use('/api/search', routes.search);
  app.use('/api/edit', routes.edit);
  app.use('/api/messages', routes.messages);
  app.use('/api/convos', routes.convos);
  app.use('/api/presets', routes.presets);
  app.use('/api/prompts', routes.prompts);
  app.use('/api/categories', routes.categories);
  app.use('/api/tokenizer', routes.tokenizer);
  app.use('/api/endpoints', routes.endpoints);
  app.use('/api/balance', routes.balance);
  app.use('/api/models', routes.models);
  app.use('/api/plugins', routes.plugins);
  app.use('/api/config', routes.config);
  app.use('/api/assistants', routes.assistants);
  app.use('/api/files', await routes.files.initialize());
  app.use('/images/', validateImageRequest, routes.staticRoute);
  app.use('/api/share', routes.share);
  app.use('/api/roles', routes.roles);
  app.use('/api/agents', routes.agents);
  app.use('/api/banner', routes.banner);
  app.use('/api/memories', routes.memories);
  app.use('/api/tags', routes.tags);
  app.use('/api/mcp', routes.mcp);
  app.use('/api/chatbot', routes.chatbot);
  app.use('/api/llm/usage', routes.llmUsage);
  app.use('/api/analytics', routes.analytics);
  app.use('/api/analytics/ingest', routes.analyticsIngest);
  app.use('/api/analytics/bots', routes.analyticsBots);
  app.use('/api/analytics/admin', routes.analyticsAdmin);
  app.use('/api/analytics/admin/metrics', routes.analyticsMetrics);
  app.use('/api/analytics/overview', routes.analyticsOverview);
  // SEO: robots.txt & sitemap.xml
  app.use('/', routes.seo);

  // Add the error controller one more time after all routes
  app.use(errorController);

  app.use((req, res) => {
    res.set({
      'Cache-Control': process.env.INDEX_CACHE_CONTROL || 'no-cache, no-store, must-revalidate',
      Pragma: process.env.INDEX_PRAGMA || 'no-cache',
      Expires: process.env.INDEX_EXPIRES || '0',
    });

    const lang = req.cookies.lang || req.headers['accept-language']?.split(',')[0] || 'en-US';
    const saneLang = lang.replace(/"/g, '&quot;');
    const updatedIndexHtml = indexHTML.replace(/lang="en-US"/g, `lang="${saneLang}"`);
    res.type('html');
    res.send(updatedIndexHtml);
  });

  // Avoid starting a real HTTP server during tests; Supertest uses the Express app directly
  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, host, () => {
      if (host === '0.0.0.0') {
        logger.info(
          `Server listening on all interfaces at port ${port}. Use http://localhost:${port} to access it`,
        );
      } else {
        logger.info(`Server listening at http://${host == '0.0.0.0' ? 'localhost' : host}:${port}`);
      }

      initializeMCPs(app);
    });
  }
};

startServer();

let messageCount = 0;
process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    logger.error('There was an uncaught error:', err);
  }

  if (err.message.includes('abort')) {
    logger.warn('There was an uncatchable AbortController error.');
    return;
  }

  if (err.message.includes('GoogleGenerativeAI')) {
    logger.warn(
      '\n\n`GoogleGenerativeAI` errors cannot be caught due to an upstream issue, see: https://github.com/google-gemini/generative-ai-js/issues/303',
    );
    return;
  }

  if (err.message.includes('fetch failed')) {
    if (messageCount === 0) {
      logger.warn('Meilisearch error, search will be disabled');
      messageCount++;
    }

    return;
  }

  if (err.message.includes('OpenAIError') || err.message.includes('ChatCompletionMessage')) {
    logger.error(
      '\n\nAn Uncaught `OpenAIError` error may be due to your reverse-proxy setup or stream configuration, or a bug in the `openai` node package.',
    );
    return;
  }

  process.exit(1);
});

/** Export app for easier testing purposes */
module.exports = app;
