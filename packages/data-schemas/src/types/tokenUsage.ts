import { ObjectId } from './index';

export interface ITokenUsage {
  _id: ObjectId;
  userId: ObjectId;
  subscriptionId: ObjectId;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  metadata?: {
    endpoint?: string;
    userAgent?: string;
    ipAddress?: string;
    [key: string]: unknown;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
