const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

/**
 * @route POST /api/stripe/webhook
 * @desc Handle Stripe webhook events
 * @access Public (Stripe webhook needs to be public)
 */
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    try {
      await stripeService.handleWebhook(signature, req.body);
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  })
);

/**
 * @route POST /api/stripe/create-checkout-session
 * @desc Create a new checkout session
 * @access Private
 */
router.post(
  '/create-checkout-session',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { priceId } = req.body;
    const userId = req.user.id;

    // Get user from database
    const user = await req.models.User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer({
        _id: user._id,
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;
      
      // Save customer ID to user
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${process.env.FRONTEND_URL}/billing/success`,
      `${process.env.FRONTEND_URL}/billing/cancel`
    );

    res.json({ url: session.url });
  })
);

/**
 * @route GET /api/stripe/billing-portal
 * @desc Get billing portal URL
 * @access Private
 */
router.get(
  '/billing-portal',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await req.models.User.findById(req.user.id);
    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: 'No subscription found' });
    }

    const session = await stripeService.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    res.json({ url: session.url });
  })
);

module.exports = router;
