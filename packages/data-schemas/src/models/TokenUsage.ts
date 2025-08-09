import { model, Schema, Types } from 'mongoose';
import { ITokenUsage } from '../types/tokenUsage';

// Definiere das Schema direkt im Modell
const tokenUsageSchema = new Schema<ITokenUsage>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subscriptionId: { 
    type: Schema.Types.ObjectId, 
    ref: 'UserSubscription',
    required: true 
  },
  model: { 
    type: String, 
    required: true 
  },
  promptTokens: { 
    type: Number, 
    default: 0 
  },
  completionTokens: { 
    type: Number, 
    default: 0 
  },
  totalTokens: { 
    type: Number, 
    default: 0 
  },
  cost: { 
    type: Number, 
    default: 0 
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
tokenUsageSchema.index({ userId: 1, model: 1, createdAt: -1 });

// Erstelle und exportiere das Modell
export const TokenUsage = model<ITokenUsage>('TokenUsage', tokenUsageSchema);
