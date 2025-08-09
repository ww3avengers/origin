import { model, Schema, Types } from 'mongoose';
import { IWhiteLabelTenant } from '../types/whiteLabelTenant';

// Definiere das Schema direkt im Modell
const whiteLabelTenantSchema = new Schema<IWhiteLabelTenant>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domains: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  branding: {
    logoUrl: String,
    faviconUrl: String,
    primaryColor: {
      type: String,
      default: '#2563eb' // Blau als Standardfarbe
    },
    secondaryColor: {
      type: String,
      default: '#1e40af' // Dunkleres Blau
    },
    fontFamily: {
      type: String,
      default: 'Inter, system-ui, sans-serif'
    },
    customCss: String
  },
  settings: {
    isActive: {
      type: Boolean,
      default: true
    },
    allowCustomDomain: {
      type: Boolean,
      default: false
    },
    maxUsers: {
      type: Number,
      default: 10
    },
    customDomain: {
      type: String,
      trim: true,
      lowercase: true
    },
    isCustomDomainVerified: {
      type: Boolean,
      default: false
    }
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'UserSubscription',
    required: false
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
whiteLabelTenantSchema.index({ slug: 1 }, { unique: true });
whiteLabelTenantSchema.index({ ownerId: 1 });
whiteLabelTenantSchema.index({ 'settings.isActive': 1 });

// Erstelle und exportiere das Modell
export const WhiteLabelTenant = model<IWhiteLabelTenant>('WhiteLabelTenant', whiteLabelTenantSchema);
