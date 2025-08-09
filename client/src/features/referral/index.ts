export { default as ReferralDashboard } from './components/ReferralDashboard';
export { default as ReferralsList } from './components/ReferralsList';
export { default as ReferralStatCard } from './components/ReferralStatCard';
export { default as ShareModal } from './components/ShareModal';

// Service-Funktionen exportieren
export {
  getUserReferrals,
  getReferralStats,
  getReferralCode,
  completeReferral,
  generateReferralUrl,
  formatCurrency,
  type ReferralData,
  type ReferralStats
} from './services/referralService';
