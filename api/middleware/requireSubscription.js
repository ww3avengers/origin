const { SystemRoles } = require('librechat-data-provider');
const { logger } = require('@librechat/data-schemas');

/**
 * Middleware to check if user has an active subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireSubscription = (req, res, next) => {
  // Skip check for admin users
  if (req.user?.role === SystemRoles.ADMIN) {
    return next();
  }

  // Check if user has active subscription
  if (!req.user?.hasActiveSubscription) {
    logger.warn(`[requireSubscription] User ${req.user?.id} has no active subscription`);
    return res.status(403).json({
      success: false,
      message: 'Active subscription required',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  }

  next();
};

/**
 * Middleware to check if user has a specific plan or higher
 * @param {string} requiredPlan - The minimum required plan
 * @returns {Function} Middleware function
 */
const requirePlan = (requiredPlan) => {
  const planLevels = {
    free: 0,
    pro: 1,
    enterprise: 2,
  };

  return (req, res, next) => {
    // Skip check for admin users
    if (req.user?.role === SystemRoles.ADMIN) {
      return next();
    }

    const userPlan = req.user?.subscription?.plan || 'free';
    
    if (planLevels[userPlan] < planLevels[requiredPlan]) {
      logger.warn(`[requirePlan] User ${req.user?.id} requires at least ${requiredPlan} plan`);
      return res.status(403).json({
        success: false,
        message: `This feature requires the ${requiredPlan} plan or higher`,
        code: 'UPGRADE_REQUIRED',
        requiredPlan,
      });
    }

    next();
  };
};

module.exports = {
  requireSubscription,
  requirePlan,
};
