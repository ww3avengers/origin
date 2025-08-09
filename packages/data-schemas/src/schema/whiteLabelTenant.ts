import { Schema } from 'mongoose';

export interface IWhiteLabelTenant {
  name: string;
  domain: string;
  ownerId: Schema.Types.ObjectId;
  subscriptionPlanId: Schema.Types.ObjectId;
  isActive: boolean;
  branding: {
    logoUrl: string;
    faviconUrl?: string;
    primaryColor: string;
    secondaryColor?: string;
    tertiaryColor?: string;
    fontFamily?: string;
    customCss?: string;
    customJs?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
    footerText?: string;
  };
  settings: {
    allowCustomDomains: boolean;
    maxCustomDomains: number;
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: string;
  };
  customDomains: Array<{
    domain: string;
    isVerified: boolean;
    verificationCode?: string;
    verifiedAt?: Date;
    createdAt: Date;
  }>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const whiteLabelTenantSchema = new Schema<IWhiteLabelTenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i, 'is not a valid domain'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    branding: {
      logoUrl: {
        type: String,
        required: true,
      },
      faviconUrl: String,
      primaryColor: {
        type: String,
        default: '#3b82f6', // Default blue-500
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'is not a valid hex color'],
      },
      secondaryColor: {
        type: String,
        default: '#6366f1', // Default indigo-500
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'is not a valid hex color'],
      },
      tertiaryColor: {
        type: String,
        default: '#8b5cf6', // Default violet-500
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'is not a valid hex color'],
      },
      fontFamily: {
        type: String,
        default: 'Inter, system-ui, sans-serif',
      },
      customCss: String,
      customJs: String,
      metaTitle: String,
      metaDescription: String,
      metaImage: String,
      footerText: String,
    },
    settings: {
      allowCustomDomains: {
        type: Boolean,
        default: false,
      },
      maxCustomDomains: {
        type: Number,
        default: 1,
        min: 0,
      },
      allowUserRegistration: {
        type: Boolean,
        default: true,
      },
      requireEmailVerification: {
        type: Boolean,
        default: true,
      },
      defaultUserRole: {
        type: String,
        default: 'user',
      },
    },
    customDomains: [{
      domain: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationCode: String,
      verifiedAt: Date,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
whiteLabelTenantSchema.index({ domain: 1 }, { unique: true });
whiteLabelTenantSchema.index({ ownerId: 1 });
whiteLabelTenantSchema.index({ 'customDomains.domain': 1 }, { sparse: true });

export default whiteLabelTenantSchema;
