import { Schema } from 'mongoose';

export interface ITokenUsage {
  userId: Schema.Types.ObjectId;
  subscriptionId: Schema.Types.ObjectId;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  metadata?: {
    endpoint?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenUsageSchema = new Schema<ITokenUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'UserSubscription',
      required: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      index: true,
    },
    promptTokens: {
      type: Number,
      required: true,
      min: 0,
    },
    completionTokens: {
      type: Number,
      required: true,
      min: 0,
    },
    totalTokens: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    metadata: {
      endpoint: String,
      userAgent: String,
      ipAddress: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for faster lookups
tokenUsageSchema.index({ userId: 1, model: 1, timestamp: -1 });

export default tokenUsageSchema;
