const { logger } = require('@librechat/data-schemas');
const { SystemRoles } = require('librechat-data-provider');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { getUserById, updateUser } = require('~/models');
const SubscriptionService = require('~/services/subscriptionService');

// JWT strategy with subscription check
const jwtLogin = () =>
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // Get user with subscription data
        const user = await getUserById(payload?.id, '-password -__v -totpSecret');
        
        if (!user) {
          logger.warn('[jwtLogin] JwtStrategy => no user found: ' + payload?.id);
          return done(null, false);
        }

        // Set user ID as string
        user.id = user._id.toString();
        
        // Set default role if not exists
        if (!user.role) {
          user.role = SystemRoles.USER;
          await updateUser(user.id, { role: user.role });
        }

        // Initialize subscription if not exists
        if (!user.subscription) {
          const freePlan = SubscriptionService.getPlanDetails('free');
          user.subscription = {
            status: 'active',
            plan: 'free',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            cancelAtPeriodEnd: false,
            monthlyUsage: {
              tokens: 0,
              requests: 0,
              lastReset: new Date(),
            },
            limits: freePlan.limits,
          };
          
          // Save the updated user with subscription
          await updateUser(user.id, { subscription: user.subscription });
        }

        // Check if subscription is still active
        if (user.subscription.status !== 'active' && user.role === SystemRoles.USER) {
          logger.warn(`[jwtLogin] User ${user.id} has no active subscription`);
          // Don't block login, but add a flag
          user.hasActiveSubscription = false;
        } else {
          user.hasActiveSubscription = true;
        }

        // Add subscription info to user object for easier access
        user.plan = user.subscription.plan;
        user.subscriptionStatus = user.subscription.status;

        return done(null, user);
      } catch (err) {
        logger.error('[jwtLogin] Error in JWT strategy:', err);
        return done(err, false);
      }
    },
  );

module.exports = jwtLogin;
