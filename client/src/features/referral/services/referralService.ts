import apiClient from '~/lib/api';

export interface ReferralData {
  id: string;
  referrer: string;
  referred: {
    name: string;
    email: string;
  } | null;
  code: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  commissionRate: number;
  commissionsEarned: number;
  commissionsWithdrawn: number;
  clickCount: number;
  conversionDate?: string;
  lastCommissionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralStats {
  totalClicks: number;
  totalReferrals: number;
  totalCommission: number;
  conversionRate: number;
}

/**
 * Holt alle Referrals des aktuellen Benutzers
 * @returns Liste der Referrals
 */
export const getUserReferrals = async (): Promise<ReferralData[]> => {
  const { data } = await apiClient.get('/api/referrals');
  return data;
};

/**
 * Holt Statistiken zu den Referrals des aktuellen Benutzers
 * @returns Statistiken zu den Referrals
 */
export const getReferralStats = async (): Promise<ReferralStats> => {
  const { data } = await apiClient.get('/api/referrals/stats');
  return data;
};

/**
 * Generiert oder holt einen Referral-Code für den aktuellen Benutzer
 * @returns Der Referral-Code
 */
export const getReferralCode = async (): Promise<{ code: string }> => {
  const { data } = await apiClient.post('/api/referrals/code');
  return data;
};

/**
 * Schließt ein Referral ab, wenn ein neuer Benutzer sich registriert
 * @param code - Der Referral-Code
 * @returns Success-Meldung
 */
export const completeReferral = async (code: string): Promise<{ message: string }> => {
  const { data } = await apiClient.post('/api/referrals/complete', { code });
  return data;
};

/**
 * Erzeugt eine volle Referral-URL mit dem Code
 * @param code - Der Referral-Code
 * @returns Die vollständige Referral-URL
 */
export const generateReferralUrl = (code: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/signup?ref=${code}`;
};

/**
 * Formatiert einen Betrag als Währung
 * @param amount - Der zu formatierende Betrag
 * @param currency - Die Währung (default: EUR)
 * @returns Formatierter Betrag
 */
export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
