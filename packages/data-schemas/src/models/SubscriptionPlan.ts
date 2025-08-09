import { model, Schema, Types } from 'mongoose';
import { ISubscriptionPlan } from '../types/subscriptionPlan';

// Definiere das Schema direkt im Modell
const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  billingCycle: { 
    type: String, 
    required: true, 
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  features: {
    maxTokens: { type: Number, required: true },
    maxRequests: { type: Number, required: true },
    maxUsers: { type: Number, required: true },
    apiAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  trialPeriodDays: { type: Number, default: 0 },
  stripePriceId: { type: String },
  stripeProductId: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Erstelle und exportiere das Modell
export const SubscriptionPlan = model<ISubscriptionPlan>(
  'SubscriptionPlan', 
  subscriptionPlanSchema
);
