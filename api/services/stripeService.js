const Stripe = require('stripe');
const { User } = require('../models');

class StripeService {
  constructor() {
    this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  async createCustomer(userData) {
    return this.stripe.customers.create({
      email: userData.email,
      name: userData.name,
      metadata: {
        userId: userData._id.toString(),
      },
    });
  }

  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
    return this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'sepa_debit', 'sofort'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });
  }

  async handleWebhook(signature, payload) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      throw new Error('Webhook verification failed');
    }

    const session = event.data.object;
    
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionUpdate(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  async handleCheckoutSessionCompleted(session) {
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;

    // Update user with subscription details
    await User.findOneAndUpdate(
      { 'subscription.customerId': customerId },
      {
        'subscription.status': subscription.status,
        'subscription.plan': priceId,
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      }
    );
  }

  async handleSubscriptionUpdate(subscription) {
    await User.findOneAndUpdate(
      { 'subscription.customerId': subscription.customer },
      {
        'subscription.status': subscription.status,
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      }
    );
  }

  async handleInvoicePaid(invoice) {
    // Handle successful payment
    // Update user's subscription status, add credits, etc.
  }

  async handlePaymentFailed(invoice) {
    // Handle failed payment
    // Notify user, update subscription status, etc.
  }
}

module.exports = new StripeService();
