const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'paused'],
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    // Stripe specific fields
    stripeCustomerId: {
      type: String,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      index: true,
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
      },
      maxRequestsPerMinute: {
        type: Number,
        required: true,
      },
      maxConcurrentRequests: {
        type: Number,
        required: true,
      },
      modelAccess: [{
        type: String,
      }],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ 'limits.monthlyTokens': 1 });

// Static method to get default subscription limits
subscriptionSchema.statics.getPlanLimits = function(plan) {
  const plans = {
    free: {
      monthlyTokens: 10000, // 10k tokens (~7.5k words)
      maxRequestsPerMinute: 10,
      maxConcurrentRequests: 2,
      modelAccess: ['gpt-3.5-turbo'],
    },
    pro: {
      monthlyTokens: 1000000, // 1M tokens (~750k words)
      maxRequestsPerMinute: 60,
      maxConcurrentRequests: 10,
      modelAccess: ['gpt-3.5-turbo', 'gpt-4', 'claude-2'],
    },
    enterprise: {
      monthlyTokens: 10000000, // 10M tokens (~7.5M words)
      maxRequestsPerMinute: 200,
      maxConcurrentRequests: 50,
      modelAccess: ['gpt-3.5-turbo', 'gpt-4', 'claude-2', 'claude-2-100k'],
    },
  };

  return plans[plan] || plans.free;
};

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trialing';
};

// Method to check token usage
subscriptionSchema.methods.hasReachedLimit = function() {
  if (this.plan === 'enterprise') {
    return false; // No limits for enterprise
  }
  return this.monthlyUsage.tokens >= this.limits.monthlyTokens;
};

// Method to add token usage
subscriptionSchema.methods.addUsage = async function(tokens) {
  // Reset monthly usage if it's a new month
  const now = new Date();
  const lastReset = new Date(this.monthlyUsage.lastReset);
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.monthlyUsage = {
      tokens: 0,
      requests: 0,
      lastReset: now,
    };
  }

  this.monthlyUsage.tokens += tokens;
  this.monthlyUsage.requests += 1;
  
  await this.save();
  return this;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
