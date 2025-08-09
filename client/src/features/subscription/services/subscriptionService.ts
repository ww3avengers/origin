import apiClient from '~/lib/api';

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  monthlyUsage: {
    tokens: number;
    requests: number;
    lastReset: string;
  };
  limits: {
    monthlyTokens: number;
    maxRequestsPerMinute: number;
    maxConcurrentRequests: number;
    modelAccess: string[];
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export const getSubscription = async (): Promise<Subscription> => {
  const { data } = await apiClient.get('/api/subscription');
  return data;
};

export const createSubscription = async (plan: string, paymentMethodId: string) => {
  const { data } = await apiClient.post('/api/subscription', {
    plan,
    paymentMethodId,
  });
  return data;
};

export const updateSubscription = async (plan: string) => {
  const { data } = await apiClient.put('/api/subscription/plan', { plan });
  return data;
};

export const cancelSubscription = async (atPeriodEnd = true) => {
  const { data } = await apiClient.delete(`/api/subscription?atPeriodEnd=${atPeriodEnd}`);
  return data;
};

export const resumeSubscription = async () => {
  const { data } = await apiClient.post('/api/subscription/resume');
  return data;
};

export const getBillingPortalUrl = async () => {
  const { data } = await apiClient.get('/api/subscription/portal');
  return data;
};

export const getCheckoutSession = async (priceId: string) => {
  const { data } = await apiClient.post('/api/subscription/checkout', { priceId });
  return data;
};

// Hilfsfunktion zum Formatieren von Preisen
const formatPrice = (amount: number, currency = 'eur') => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

// Export der Hilfsfunktion für die Verwendung in Komponenten
export { formatPrice };
