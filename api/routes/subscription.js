const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const SubscriptionService = require('../services/subscriptionService');
const asyncHandler = require('express-async-handler');

/**
 * @route GET /api/subscription
 * @desc Get current user's subscription details
 * @access Private
 */
router.get(
  '/',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const subscription = await SubscriptionService.getSubscription(req.user.id);
    res.json(subscription);
  })
);

/**
 * @route POST /api/subscription
 * @desc Create or update a subscription
 * @access Private
 */
router.post(
  '/',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { plan, paymentMethodId } = req.body;
    
    if (!plan || !paymentMethodId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan and payment method are required' 
      });
    }

    const result = await SubscriptionService.createSubscription(
      req.user.id,
      plan,
      paymentMethodId
    );

    res.json({
      success: true,
      ...result,
    });
  })
);

/**
 * @route PUT /api/subscription/plan
 * @desc Change subscription plan
 * @access Private
 */
router.put(
  '/plan',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { plan } = req.body;
    
    if (!plan) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan is required' 
      });
    }

    const result = await SubscriptionService.updateSubscription(
      req.user.id,
      plan
    );

    res.json(result);
  })
);

/**
 * @route DELETE /api/subscription
 * @desc Cancel subscription
 * @access Private
 */
router.delete(
  '/',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { atPeriodEnd = true } = req.query;
    const result = await SubscriptionService.cancelSubscription(
      req.user.id,
      atPeriodEnd === 'true'
    );
    res.json(result);
  })
);

/**
 * @route POST /api/subscription/resume
 * @desc Resume a canceled subscription
 * @access Private
 */
router.post(
  '/resume',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const result = await SubscriptionService.resumeSubscription(req.user.id);
    res.json(result);
  })
);

/**
 * @route GET /api/subscription/portal
 * @desc Get billing portal URL
 * @access Private
 */
router.get(
  '/portal',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const url = await SubscriptionService.getBillingPortalUrl(req.user.id);
    res.json({ url });
  })
);

/**
 * @route POST /api/subscription/webhook
 * @desc Handle Stripe webhook events
 * @access Public (Stripe webhook)
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      await SubscriptionService.handleWebhookEvent(event);
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  })
);

module.exports = router;
