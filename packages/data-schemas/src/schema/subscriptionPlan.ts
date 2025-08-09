import { Schema } from 'mongoose';

export interface ISubscriptionPlan {
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  tokensPerMonth: number;
  maxUsers?: number;
  maxProjects?: number;
  maxStorageGB?: number;
  features: string[];
  isActive: boolean;
  isDefault: boolean;
  isWhiteLabel: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    tokensPerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    maxUsers: {
      type: Number,
      default: 1,
    },
    maxProjects: {
      type: Number,
      default: 5,
    },
    maxStorageGB: {
      type: Number,
      default: 10,
    },
    features: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isWhiteLabel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default subscriptionPlanSchema;
