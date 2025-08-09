import { Schema } from 'mongoose';

// Subscription sub-schema
const SubscriptionSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'paused'],
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      required: true,
      default: 'free',
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    // Stripe specific fields
    stripeCustomerId: {
      type: String,
      index: true,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      index: true,
      sparse: true,
    },
    // Usage tracking
    monthlyUsage: {
      tokens: {
        type: Number,
        default: 0,
      },
      requests: {
        type: Number,
        default: 0,
      },
      lastReset: {
        type: Date,
        default: Date.now,
      },
    },
    // Plan limits
    limits: {
      monthlyTokens: {
        type: Number,
        required: true,
        default: 10000, // 10k tokens for free tier
      },
      maxRequestsPerMinute: {
        type: Number,
        required: true,
        default: 10, // 10 RPM for free tier
      },
      maxConcurrentRequests: {
        type: Number,
        required: true,
        default: 2, // 2 concurrent requests for free tier
      },
      modelAccess: {
        type: [String],
        default: () => ['gpt-3.5-turbo'], // Default model access for free tier
      },
    },
  },
  { _id: false, timestamps: true }
);

export default SubscriptionSchema;
