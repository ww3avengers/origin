import { ObjectId } from './index';

export interface ISubscriptionPlan {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: {
    maxTokens: number;
    maxRequests: number;
    maxUsers: number;
    apiAccess: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    whiteLabel: boolean;
  };
  isActive: boolean;
  isDefault: boolean;
  trialPeriodDays?: number;
  stripePriceId?: string;
  stripeProductId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
