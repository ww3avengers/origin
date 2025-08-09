const { RateLimiterMemory } = require('rate-limiter-flexible');
const { User } = require('../models');

// Rate limiter for API requests
const rateLimiters = new Map();

// Initialize rate limiter for a user
function getUserRateLimiter(userId, rpmLimit) {
  if (!rateLimiters.has(userId)) {
    rateLimiters.set(
      userId,
      new RateLimiterMemory({
        points: rpmLimit, // Requests per minute
        duration: 60, // Per minute
      })
    );
  }
  return rateLimiters.get(userId);
}

// Middleware to check subscription limits
const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if subscription is active
    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(403).json({ 
        message: 'No active subscription',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    // Check monthly token limit
    if (user.subscription.plan !== 'enterprise' && 
        user.subscription.monthlyUsage.tokens >= user.subscription.limits.monthlyTokens) {
      return res.status(429).json({ 
        message: 'Monthly token limit exceeded',
        code: 'MONTHLY_LIMIT_EXCEEDED',
      });
    }

    // Get or create rate limiter for user
    const limiter = getUserRateLimiter(userId, user.subscription.limits.maxRequestsPerMinute);
    
    try {
      await limiter.consume(req.ip);
      next();
    } catch (rlRejected) {
      if (rlRejected instanceof Error) {
        throw rlRejected;
      }
      
      const retryAfter = Math.ceil(rlRejected.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(retryAfter));
      
      return res.status(429).json({
        message: 'Too many requests',
        retryAfter,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }
  } catch (error) {
    console.error('Subscription check error:', error);
    next(error);
  }
};

// Middleware to track token usage
const trackTokenUsage = async (req, res, next) => {
  const originalSend = res.send;
  const userId = req.user?.id;
  
  if (!userId) {
    return next();
  }

  res.send = async function (body) {
    try {
      // Only track successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const contentLength = parseInt(res.get('Content-Length') || '0', 10);
        // Estimate token usage (this is a rough estimate, adjust based on your needs)
        const tokenEstimate = Math.ceil(contentLength / 4);
        
        if (tokenEstimate > 0) {
          await User.updateOne(
            { _id: userId },
            { 
              $inc: { 
                'subscription.monthlyUsage.tokens': tokenEstimate,
                'subscription.monthlyUsage.requests': 1 
              } 
            }
          );
        }
      }
    } catch (error) {
      console.error('Error tracking token usage:', error);
    }
    
    return originalSend.call(this, body);
  };

  next();
};

// Middleware to check if user has access to a specific model
const checkModelAccess = (modelName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Enterprise users have access to all models
      if (user.subscription.plan === 'enterprise') {
        return next();
      }

      // Check if model is in user's allowed models
      if (!user.subscription.limits.modelAccess.includes(modelName)) {
        return res.status(403).json({ 
          message: 'Model not available in your plan',
          code: 'MODEL_ACCESS_DENIED',
        });
      }

      next();
    } catch (error) {
      console.error('Model access check error:', error);
      next(error);
    }
  };
};

module.exports = {
  checkSubscription,
  trackTokenUsage,
  checkModelAccess,
};
