import { ObjectId } from './index';

export interface IWhiteLabelTenant {
  _id: ObjectId;
  name: string;
  slug: string;
  ownerId: ObjectId;
  domains: string[];
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCss?: string;
  };
  settings: {
    isActive: boolean;
    allowCustomDomain: boolean;
    maxUsers: number;
    customDomain?: string;
    isCustomDomainVerified: boolean;
  };
  subscriptionId?: ObjectId;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
