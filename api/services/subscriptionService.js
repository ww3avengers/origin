const { User } = require('~/models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

class SubscriptionService {
  /**
   * Get the current user's subscription details
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} The user's subscription details
   */
  static async getSubscription(userId) {
    const user = await User.findById(userId).select('subscription');
    if (!user) {
      throw new Error('User not found');
    }
    
    return user.subscription;
  }

  /**
   * Create a new subscription for a user
   * @param {string} userId - The user's ID
   * @param {string} plan - The plan to subscribe to (free, pro, enterprise)
   * @param {string} paymentMethodId - The Stripe payment method ID
   * @returns {Promise<Object>} The created subscription
   */
  static async createSubscription(userId, plan, paymentMethodId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get plan details
    const planDetails = this.getPlanDetails(plan);
    
    let customer;
    let subscription;

    try {
      // Create or get Stripe customer
      if (user.subscription?.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: user.name || user.username || '',
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Create subscription
      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: planDetails.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId.toString(),
          plan,
        },
      });

      // Update user with subscription details
      user.subscription = {
        ...user.subscription.toObject(),
        status: 'incomplete',
        plan,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: false,
        limits: planDetails.limits,
      };

      await user.save();

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        requiresAction: subscription.latest_invoice.payment_intent.status === 'requires_action',
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Update a user's subscription plan
   * @param {string} userId - The user's ID
   * @param {string} newPlan - The new plan to switch to
   * @returns {Promise<Object>} The updated subscription
   */
  static async updateSubscription(userId, newPlan) {
    const user = await User.findById(userId);
    if (!user || !user.subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    const currentPlan = user.subscription.plan;
    if (currentPlan === newPlan) {
      return { message: 'Already on this plan' };
    }

    const planDetails = this.getPlanDetails(newPlan);
    
    try {
      const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
      
      // Update the subscription
      const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
        items: [{
          id: subscription.items.data[0].id,
          price: planDetails.priceId,
        }],
        proration_behavior: 'create_prorations',
        payment_behavior: 'pending_if_incomplete',
      });

      // Update user's subscription details
      user.subscription.plan = newPlan;
      user.subscription.limits = planDetails.limits;
      user.subscription.currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000);
      
      await user.save();

      return {
        success: true,
        message: `Subscription updated to ${newPlan} plan`,
        subscription: user.subscription,
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * Cancel a user's subscription
   * @param {string} userId - The user's ID
   * @param {boolean} atPeriodEnd - Whether to cancel at the end of the billing period
   * @returns {Promise<Object>} The cancellation status
   */
  static async cancelSubscription(userId, atPeriodEnd = true) {
    const user = await User.findById(userId);
    if (!user || !user.subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    try {
      if (atPeriodEnd) {
        // Schedule cancellation at period end
        const subscription = await stripe.subscriptions.update(
          user.subscription.stripeSubscriptionId,
          { cancel_at_period_end: true }
        );

        user.subscription.cancelAtPeriodEnd = true;
        user.subscription.status = 'canceled';
        await user.save();

        return {
          success: true,
          message: 'Subscription will be canceled at the end of the billing period',
          cancelAt: new Date(subscription.cancel_at * 1000),
        };
      } else {
        // Cancel immediately
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
        
        // Downgrade to free plan
        const freePlan = this.getPlanDetails('free');
        user.subscription = {
          ...user.subscription.toObject(),
          status: 'active',
          plan: 'free',
          cancelAtPeriodEnd: false,
          limits: freePlan.limits,
          monthlyUsage: {
            tokens: 0,
            requests: 0,
            lastReset: new Date(),
          },
        };
        
        await user.save();

        return {
          success: true,
          message: 'Subscription canceled successfully',
        };
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Resume a canceled subscription
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} The updated subscription
   */
  static async resumeSubscription(userId) {
    const user = await User.findById(userId);
    if (!user || !user.subscription?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    if (!user.subscription.cancelAtPeriodEnd) {
      return { message: 'Subscription is not scheduled for cancellation' };
    }

    try {
      const subscription = await stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        { cancel_at_period_end: false }
      );

      user.subscription.cancelAtPeriodEnd = false;
      user.subscription.status = 'active';
      user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      await user.save();

      return {
        success: true,
        message: 'Subscription has been resumed',
        subscription: user.subscription,
      };
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw new Error('Failed to resume subscription');
    }
  }

  /**
   * Get the billing portal URL for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<string>} The billing portal URL
   */
  static async getBillingPortalUrl(userId) {
    const user = await User.findById(userId);
    if (!user || !user.subscription?.stripeCustomerId) {
      throw new Error('No subscription found');
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL}/dashboard/billing`,
      });

      return session.url;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }

  /**
   * Get plan details including price ID and limits
   * @private
   */
  static getPlanDetails(plan) {
    const plans = {
      free: {
        priceId: process.env.STRIPE_PRICE_ID_FREE || 'price_free',
        limits: {
          monthlyTokens: 10000,
          maxRequestsPerMinute: 10,
          maxConcurrentRequests: 2,
          modelAccess: ['gpt-3.5-turbo'],
        },
      },
      pro: {
        priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
        limits: {
          monthlyTokens: 1000000,
          maxRequestsPerMinute: 60,
          maxConcurrentRequests: 10,
          modelAccess: ['gpt-3.5-turbo', 'gpt-4'],
        },
      },
      enterprise: {
        priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise',
        limits: {
          monthlyTokens: 10000000,
          maxRequestsPerMinute: 200,
          maxConcurrentRequests: 50,
          modelAccess: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-2'],
        },
      },
    };

    return plans[plan] || plans.free;
  }

  /**
   * Handle webhook events from Stripe
   * @param {Object} event - The Stripe event
   */
  static async handleWebhookEvent(event) {
    const subscription = event.data.object;
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.warn('No user ID found in subscription metadata');
      return { received: true };
    }

    const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
    if (!user) {
      console.warn(`No user found for subscription ${subscription.id}`);
      return { received: true };
    }

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const plan = subscription.metadata?.plan || 'free';
        const planDetails = this.getPlanDetails(plan);
        
        user.subscription = {
          ...user.subscription.toObject(),
          status: subscription.status,
          plan,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          limits: planDetails.limits,
        };
        break;
      }
      
      case 'customer.subscription.deleted':
        // Downgrade to free plan if subscription is deleted
        const freePlan = this.getPlanDetails('free');
        user.subscription = {
          ...user.subscription.toObject(),
          status: 'canceled',
          plan: 'free',
          cancelAtPeriodEnd: false,
          limits: freePlan.limits,
          monthlyUsage: {
            tokens: 0,
            requests: 0,
            lastReset: new Date(),
          },
        };
        break;

      case 'invoice.payment_succeeded':
        // Reset monthly usage at the start of a new billing period
        if (subscription.billing_reason === 'subscription_cycle') {
          user.subscription.monthlyUsage = {
            tokens: 0,
            requests: 0,
            lastReset: new Date(),
          };
        }
        break;

      case 'invoice.payment_failed':
        // Handle payment failure (e.g., send email notification)
        if (subscription.attempt_count > 2) {
          user.subscription.status = 'past_due';
        }
        break;
    }

    await user.save();
    return { received: true };
  }
}

module.exports = SubscriptionService;
