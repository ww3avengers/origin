import { useCallback, useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import type { i18n as I18nType } from 'i18next';
import store from '~/store';

// Ermöglicht sowohl Template-Tag-Nutzung (localize`key`) als auch Funktionsaufruf (localize('key'))
export type LocalizeFn = {
  (key: string, options?: any): string;
  (strings: TemplateStringsArray, ...expr: unknown[]): string;
};

export default function useLocalize(): LocalizeFn {
  const lang = useRecoilValue(store.lang);
  const setLang = useSetRecoilState(store.lang);
  // Hinweis: Der Cast vermeidet Namespace-Typkonflikte zwischen App- und Package-Typen,
  // ohne die Laufzeitfunktionalität zu beeinträchtigen.
  const { t, i18n }: any = useTranslation(['translation', 'landing'] as any);
  // Ref muss auf Top-Level der Hook initialisiert werden (nicht innerhalb von useEffect),
  // um die Rules of Hooks einzuhalten und den Invalid-Hook-Call zu verhindern.
  const didInitRef = useRef(false);

  useEffect(() => {
    // On first run, align store language to i18n to avoid initial flip
    if (!didInitRef.current) {
      didInitRef.current = true;
      try {
        // Bevor wir irgendetwas überschreiben: Wenn URL kein Sprachpräfix hat und kein ?lng vorhanden ist,
        // bevorzugen wir die aktuell aktive i18n-Sprache (standardmäßig 'de') und schreiben Store/Persistenz darauf.
        if (typeof window !== 'undefined') {
          const hasPrefix = /^\/(de|en)(?=\/|$)/.test(window.location.pathname || '/');
          const hasQueryLng = new URLSearchParams(window.location.search).has('lng');
          if (!hasPrefix && !hasQueryLng) {
            const current = ((i18n as any).language || 'de').toLowerCase().startsWith('en')
              ? 'en'
              : 'de';
            if (current !== lang) {
              setLang(current as any);
            }
            try {
              window.localStorage.setItem('lang', current);
              window.localStorage.setItem('i18nextLng', current);
              document.cookie = `lang=${encodeURIComponent(current)}; path=/; max-age=${60 * 60 * 24 * 365}`;
            } catch {}
            // Frühzeitiger Exit: vermeidet, dass persistierte alte Werte (z. B. 'en') i18n wieder überschreiben
            return;
          }
        }
        const i18nLang = (i18n as any).language as string | undefined;
        const norm = (s?: string | null) => {
          if (!s) return undefined;
          const lc = s.toLowerCase();
          if (lc.startsWith('de')) return 'de';
          if (lc.startsWith('en')) return 'en';
          return undefined;
        };
        const i18nNorm = norm(i18nLang);
        if (i18nNorm && i18nNorm !== lang) {
          setLang(i18nNorm as any);
          try {
            window.localStorage.setItem('lang', i18nNorm);
            window.localStorage.setItem('i18nextLng', i18nNorm);
          } catch {}
          return; // prevent further changes in this tick
        }
      } catch {
        // ignore
      }
    }

    const i18nAny = i18n as any;
    // Schutz: auf pfadlosen URLs ohne ?lng niemals i18n auf persistierte Abweichung zurücksetzen.
    if (typeof window !== 'undefined') {
      const hasPrefix = /^\/(de|en)(?=\/|$)/.test(window.location.pathname || '/');
      const hasQueryLng = new URLSearchParams(window.location.search).has('lng');
      if (!hasPrefix && !hasQueryLng) {
        // Align Persistenz & Store an i18n, sofern nötig
        const current = (i18nAny.language || 'de').toLowerCase().startsWith('en') ? 'en' : 'de';
        if (current !== lang) {
          setLang(current as any);
        }
        try {
          window.localStorage.setItem('lang', current);
          window.localStorage.setItem('i18nextLng', current);
          document.cookie = `lang=${encodeURIComponent(current)}; path=/; max-age=${60 * 60 * 24 * 365}`;
        } catch {}
        return;
      }
    }
    if (i18nAny.language === lang) return;
    try {
      const persisted =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('lang') || window.localStorage.getItem('i18nextLng')
          : null;
      const norm = (s?: string | null) => {
        if (!s) return undefined;
        const lc = s.toLowerCase();
        if (lc.startsWith('de')) return 'de';
        if (lc.startsWith('en')) return 'en';
        return undefined;
      };
      const persistedNorm = norm(persisted);
      const i18nNorm = norm(i18nAny.language);

      // If no persisted selection or it matches i18n, align store to i18n to avoid flipping back
      if (!persistedNorm || persistedNorm === i18nNorm) {
        if (i18nNorm && i18nNorm !== lang) {
          setLang(i18nNorm as any);
          try {
            window.localStorage.setItem('lang', i18nNorm);
            window.localStorage.setItem('i18nextLng', i18nNorm);
          } catch {}
        }
        return;
      }
    } catch {
      // ignore
    }
    // Otherwise respect store and update i18n
    // Clamp language to URL prefix when present to avoid flips (e.g., rendering EN on /de)
    let effectiveLang = lang as 'de' | 'en';
    if (typeof window !== 'undefined') {
      try {
        const match = (window.location.pathname || '/').match(/^\/(de|en)(?=\/|$)/);
        const pathLang = (match?.[1] as 'de' | 'en' | undefined) || undefined;
        if (pathLang && pathLang !== effectiveLang) {
          effectiveLang = pathLang;
          if (pathLang !== lang) {
            setLang(pathLang as any);
          }
        }
        // On routes without prefix and without ?lng, never allow EN; lock to DE
        const hasQueryLng = new URLSearchParams(window.location.search).has('lng');
        const hasPrefix = Boolean(pathLang);
        if (!hasPrefix && !hasQueryLng) {
          effectiveLang = 'de';
          if (lang !== 'de') {
            setLang('de' as any);
          }
        }
      } catch {
        /* noop */
      }
    }

    if (i18nAny.language !== effectiveLang) {
      i18nAny.changeLanguage(effectiveLang);
    }
    try {
      window.localStorage.setItem('lang', effectiveLang);
      window.localStorage.setItem('i18nextLng', effectiveLang);
      document.cookie = `lang=${encodeURIComponent(effectiveLang)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = effectiveLang;
    } catch {}
  }, [lang, i18n, setLang]);

  // Type Guard für TemplateStringsArray
  const isTemplateStringsArray = (x: unknown): x is TemplateStringsArray =>
    Array.isArray(x) && Object.prototype.hasOwnProperty.call(x as any, 'raw');

  // Wrapper, der beide Aufrufarten unterstützt (stabile Referenz)
  const localize = useCallback(
    ((first: unknown, ...rest: unknown[]) => {
      // Template-Tag: first ist TemplateStringsArray
      if (isTemplateStringsArray(first)) {
        const key = first[0] as string;
        return t(key as any) as unknown as string;
      }
      // Normaler Funktionsaufruf mit Key
      return (t as unknown as (key: string, options?: any) => string)(
        first as any,
        ...(rest as any),
      );
    }) as LocalizeFn,
    [t, (i18n as I18nType).language],
  );

  return localize;
}
