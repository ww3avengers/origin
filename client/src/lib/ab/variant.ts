/*
  Simple A/B variant utility with SSR-safety and persistence.
  - Reads ?ab=cta_alt (example) to select a variant for a specific experiment key (cta)
  - Persists decision in localStorage under key `ab:<key>`
  - Falls back to persisted value, then default
*/

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export type Variant = 'base' | 'alt';

export function getVariantForKey(key: string, defaultVariant: Variant = 'base'): Variant {
  if (!isBrowser) return defaultVariant;

  try {
    const url = new URL(window.location.href);
    const abParam = url.searchParams.get('ab');

    // Pattern: cta_alt selects variant 'alt' for key 'cta'
    if (abParam) {
      const [paramKey, paramVariant] = abParam.split('_');
      if (paramKey === key && (paramVariant === 'alt' || paramVariant === 'base')) {
        window.localStorage.setItem(`ab:${key}`, paramVariant);
        return paramVariant as Variant;
      }
      // Backward compatible: if someone passes just 'cta_alt' vs 'alt'
      if (abParam === 'cta_alt' && key === 'cta') {
        window.localStorage.setItem(`ab:${key}`, 'alt');
        return 'alt';
      }
    }

    const persisted = window.localStorage.getItem(`ab:${key}`) as Variant | null;
    if (persisted === 'alt' || persisted === 'base') return persisted;

    return defaultVariant;
  } catch {
    return defaultVariant;
  }
}
