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
const { isEnabled } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const mongoSanitize = require('express-mongo-sanitize');
const { connectDb, indexSync } = require('~/db');
const rateLimit = require('express-rate-limit');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const validateImageRequest = require('./middleware/validateImageRequest');
const { jwtLogin, ldapLogin, passportLogin } = require('~/strategies');
const errorController = require('./controllers/ErrorController');
const initializeMCPs = require('./services/initializeMCPs');
const configureSocialLogins = require('./socialLogins');
const AppService = require('./services/AppService');
const staticCache = require('./utils/staticCache');
const noIndex = require('./middleware/noIndex');
const { checkSubscription, trackTokenUsage, checkModelAccess } = require('../middleware/subscription');
const routes = require('./routes');

const { PORT, HOST, ALLOW_SOCIAL_LOGIN, DISABLE_COMPRESSION, TRUST_PROXY } = process.env ?? {};

// Allow PORT=0 to be used for automatic free port assignment
const port = isNaN(Number(PORT)) ? 3080 : Number(PORT);
const host = HOST || 'localhost';
const trusted_proxy = Number(TRUST_PROXY) || 1; /* trust first proxy by default */

const app = express();

// Global rate limiter for public endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

const startServer = async () => {
  if (typeof Bun !== 'undefined') {
    axios.defaults.headers.common['Accept-Encoding'] = 'gzip';
  }
  await connectDb();

  logger.info('Connected to MongoDB');
  indexSync().catch((err) => {
    logger.error('[indexSync] Background sync failed:', err);
  });

  app.disable('x-powered-by');
  app.set('trust proxy', trusted_proxy);

  // Apply global rate limiter to all routes
  app.use(apiLimiter);

  // Apply subscription middleware to API routes
  app.use('/api', [
    checkSubscription,
    trackTokenUsage,
    // Add model-specific access control as needed, e.g.:
    // checkModelAccess('gpt-4')
  ]);

  await AppService(app);

  // Apply other middleware
  if (!DISABLE_COMPRESSION) {
    app.use(compression());
  }

  app.use(express.json({ limit: '3mb' }));
  app.use(express.urlencoded({ extended: true, limit: '3mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if the origin is allowed
        const allowedOrigins = process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(',')
          : [];
          
        if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );

  // Initialize authentication
  passport.use('jwt', jwtLogin);
  passport.use('ldap', ldapLogin);
  passport.use('login', passportLogin);
  
  app.use(passport.initialize());

  // Configure social logins if enabled
  if (isEnabled(ALLOW_SOCIAL_LOGIN)) {
    configureSocialLogins(app);
  }

  // Apply static cache and no-index headers
  app.use(staticCache);
  app.use(noIndex);

  // API routes
  app.use('/api', routes);

  // Error handling
  app.use(errorController);

  // Start the server
  const server = app.listen(port, host, () => {
    const serverAddress = server.address();
    const actualPort = typeof serverAddress === 'string' ? serverAddress : serverAddress?.port;
    logger.info(`Server is running on http://${host}:${actualPort}`);
  });

  // Initialize MCPs
  await initializeMCPs();
};

startServer();

// Handle uncaught exceptions
let messageCount = 0;
process.on('uncaughtException', (err) => {
  if (messageCount < 10) {
    logger.error('Uncaught Exception:', err);
    messageCount++;
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  if (messageCount < 10) {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    messageCount++;
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
