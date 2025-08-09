import { model, Schema, Types } from 'mongoose';
import { IUserSubscription, SubscriptionStatus } from '../types/userSubscription';

// Definiere das Schema direkt im Modell
const userSubscriptionSchema = new Schema<IUserSubscription>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  planId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SubscriptionPlan',
    required: true 
  },
  status: { 
    type: String, 
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.ACTIVE,
    required: true 
  },
  startDate: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  endDate: { 
    type: Date,
    required: false 
  },
  trialEndsAt: { 
    type: Date,
    required: false 
  },
  isTrial: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  stripeSubscriptionId: { 
    type: String,
    index: true
  },
  stripeCustomerId: { 
    type: String,
    index: true
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  metadata: { 
    type: Schema.Types.Mixed, 
    default: {} 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index für häufig abgefragte Felder
userSubscriptionSchema.index({ userId: 1, status: 1 });
userSubscriptionSchema.index({ status: 1, endDate: 1 });

// Virtuelles Feld für die verbleibenden Tage
userSubscriptionSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const now = new Date();
  const diffTime = this.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Erstelle und exportiere das Modell
export const UserSubscription = model<IUserSubscription>('UserSubscription', userSubscriptionSchema);
