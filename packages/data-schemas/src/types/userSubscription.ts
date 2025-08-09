import { ObjectId } from './index';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  PAUSED = 'paused'
}

export interface IUserSubscription {
  _id: ObjectId;
  userId: ObjectId;
  planId: ObjectId;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  trialEndsAt?: Date;
  isTrial: boolean;
  isActive: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  // Virtuelles Feld
  daysRemaining?: number | null;
}
