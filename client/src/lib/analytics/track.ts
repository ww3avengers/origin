/*
  Minimal Analytics Utility
  - Provides a single `track` function.
  - Safe no-op if no analytics provider is present.
  - Extensible: plug your GTM/GA/Segment dispatch here.
*/

const KEY = 'analytics:enabled';
const isBrowser = typeof window !== 'undefined';

export type AnalyticsEvent = {
  name: string;
  props?: Record<string, unknown>;
};

export const isAnalyticsEnabled = (): boolean => {
  if (!isBrowser) return false;
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
    // Default: enabled in production, disabled in test
    return process.env.NODE_ENV === 'production';
  } catch {
    return false;
  }
};

export const setAnalyticsEnabled = (enabled: boolean) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(KEY, String(enabled));
  } catch {
    // ignore
  }
};

export const track = ({ name, props = {} }: AnalyticsEvent) => {
  if (!isAnalyticsEnabled()) return;
  try {
    // Example: Google Tag Manager dataLayer push

    const w = window as any;
    if (Array.isArray(w?.dataLayer)) {
      w.dataLayer.push({ event: name, ...props });
      return;
    }
    // Fallback: console (dev)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[analytics]', name, props);
    }
  } catch {
    // Swallow errors to avoid breaking UX
  }
};
