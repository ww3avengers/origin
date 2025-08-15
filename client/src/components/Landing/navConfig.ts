import { tString } from '@/locales/helpers';

export type NavItem = {
  to: string;
  key: string;
  label: string;
  match: boolean;
};

// Helper to build home hash links reliably
const toHomeHash = (hash: string) => `/${hash ? `#${hash}` : ''}`;

export function getNavItems(
  t: (key: string, opts?: any) => string,
  pathname: string,
  currentHash: string,
  activeSection: string,
): NavItem[] {
  return [
    {
      to: '/',
      key: 'nav.home',
      label: tString(t, 'landing:nav.home'),
      match: pathname === '/' && (!currentHash || activeSection === ''),
    },
    {
      to: toHomeHash('use-cases'),
      key: 'nav.useCases',
      label: tString(t, 'landing:nav.useCases'),
      match: pathname === '/' && (currentHash === 'use-cases' || activeSection === 'use-cases'),
    },
    {
      to: toHomeHash('pricing'),
      key: 'nav.pricing',
      label: tString(t, 'landing:nav.pricing'),
      match: pathname === '/' && (currentHash === 'pricing' || activeSection === 'pricing'),
    },
    {
      to: toHomeHash('faq'),
      key: 'nav.faq',
      label: tString(t, 'landing:nav.faq'),
      match: pathname === '/' && (currentHash === 'faq' || activeSection === 'faq'),
    },
    // Extra: Direct access to app sections
    {
      to: '/dashboard',
      key: 'nav.dashboard',
      label: tString(t, 'landing:nav.dashboard'),
      match: pathname.startsWith('/dashboard'),
    },
    {
      to: '/app/analytics',
      key: 'nav.analytics',
      label: tString(t, 'landing:nav.analytics'),
      match: pathname.startsWith('/app') && pathname.includes('/analytics'),
    },
  ];
}
