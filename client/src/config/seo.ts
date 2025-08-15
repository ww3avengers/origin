/**
 * Zentrale SEO-Konfiguration (parametrierbar, keine Hardcodes in Komponenten)
 */
export const SITE_URL: string = (typeof process !== 'undefined' && (process as any).env?.VITE_SITE_URL) || 'https://sigmacode.ai';

export const ORG = {
  name: 'SIGMACODE AI',
  // Nutze vorhandenes Apple Touch Icon als Logo-Quelle (quadratisch, geeignet für Org-Logo)
  logo: '/assets/apple-touch-icon-180x180.png',
  // Social-Profile (optional). Leerlassen oder hier pflegen.
  sameAs: [] as string[],
};
