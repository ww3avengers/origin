import { useLocalize } from '~/hooks';
import { useCallback } from 'react';

/**
 * useTl
 * Typed localizer helper that enforces TranslationKeys and returns string.
 * Prevents leaking `unknown` into aria-labels and text nodes.
 */
export const useTl = () => {
  const localize = useLocalize();
  return (key: string, options?: Record<string, unknown>) =>
    localize(key as any, options) as unknown as string;
};

/**
 * useT
 * Sauberer i18n-Wrapper:
 * - Präfixt Keys ohne Namespace automatisch mit 'translation:'
 * - Gibt immer string zurück
 */
export const useT = () => {
  const localize = useLocalize();
  // Return a stable function to avoid re-running effects depending on `t`
  return useCallback(
    (key: string, options?: Record<string, unknown>) => {
      // Helper: derive language from URL prefix (/de or /en)
      const urlLng = (() => {
        if (typeof window === 'undefined') return undefined as 'de' | 'en' | undefined;
        const m = (window.location.pathname || '/').match(/^\/(de|en)(?=\/|$)/);
        return (m?.[1] as 'de' | 'en' | undefined) || undefined;
      })();

      // Compose options with landing-aware lng override (respect explicit options.lng)
      const withLandingLng = (ns: string, restKey: string, baseOpts?: Record<string, unknown>) => {
        if (ns !== 'landing') return { ns, restKey, opts: baseOpts } as const;
        if (baseOpts && typeof baseOpts.lng === 'string') return { ns, restKey, opts: baseOpts } as const;
        const next = urlLng ? { ...(baseOpts || {}), lng: urlLng } : baseOpts;
        return { ns, restKey, opts: next } as const;
      };

      // If key already has a namespace (e.g., "landing:nav.home"), pass through
      if (key.includes(':')) {
        const [ns, rest] = key.split(':', 2);
        const { opts } = withLandingLng(ns, rest, options);
        return localize(key as any, opts) as unknown as string;
      }

      // Special case: allow "footer.*" to resolve to landing namespace for backwards compatibility
      // Maps: footer.xyz -> landing:footer.xyz
      if (key.startsWith('footer.')) {
        const rest = key.slice('footer.'.length);
        const ns = 'landing';
        const { opts } = withLandingLng(ns, `footer.${rest}`, options);
        const resolved = `${ns}:footer.${rest}`;
        return localize(resolved as any, opts) as unknown as string;
      }

      // Auto-map known top-level prefixes to namespaces (e.g., "landing.hero.title" -> "landing:hero.title")
      const knownNamespaces = new Set(['landing', 'analytics', 'translation']);
      const dotIndex = key.indexOf('.');
      if (dotIndex > 0) {
        const maybeNS = key.slice(0, dotIndex);
        if (knownNamespaces.has(maybeNS)) {
          const rest = key.slice(dotIndex + 1);
          const { opts } = withLandingLng(maybeNS, rest, options);
          const resolved = `${maybeNS}:${rest}`;
          return localize(resolved as any, opts) as unknown as string;
        }
      }

      // Fallback to default namespace
      const resolved = `translation:${key}`;
      return localize(resolved as any, options) as unknown as string;
    },
    [localize],
  );
};
