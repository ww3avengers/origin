import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Single Source of Truth: import resources and types from the package locales
// This ensures landing translations are sourced outside the client folder
import {
  resources as pkgResources,
  defaultNS as pkgDefaultNS,
} from '../../../packages/client/src/locales/i18n';
import type { NamespaceResources } from '~/locales/types';

export const defaultNS = pkgDefaultNS;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    // Wichtig: Namespace-Shape hier deklarieren, nicht die Sprachenwurzel
    resources: NamespaceResources;
  }
}

// Initialize i18next
// Unterstützte Sprachen: Deutsch und Englisch
const supportedLngs = ['de', 'en'];

// Hilfsfunktionen zur robusten Sprachnormalisierung vor i18n.init
const normalize = (lng?: string | null) => {
  const n = (lng || '').toLowerCase();
  if (n.startsWith('de')) return 'de';
  if (n.startsWith('en')) return 'en';
  return undefined;
};

let initialLng: 'de' | 'en' = 'de';
let suppressDetection = false;
if (typeof window !== 'undefined') {
  try {
    // Path-basierte Erkennung: finde 'de' oder 'en' in beliebigem Pfadsegment
    const pathSegments = (window.location.pathname || '/').split('/').filter(Boolean);
    const pathLang =
      (pathSegments.find((s) => s === 'de' || s === 'en') as 'de' | 'en' | undefined) || undefined;
    // Hash-basierte Erkennung: '#/de', '#de', '#/en', '#en'
    const hashLang = (() => {
      const h = window.location.hash || '';
      const m = h.match(/#\/?(de|en)(?=\b|\/|$)/i);
      return m ? (m[1].toLowerCase() as 'de' | 'en') : undefined;
    })();
    const params = new URLSearchParams(window.location.search);
    const qs = normalize(params.get('lng'));
    const cookie = (() => {
      try {
        const m = document.cookie.match(/(?:^|; )lang=([^;]*)/);
        return m ? decodeURIComponent(m[1]) : null;
      } catch {
        return null;
      }
    })();
    const lsLang = (() => {
      try {
        return window.localStorage.getItem('lang');
      } catch {
        return null;
      }
    })();
    const lsI18nextLng = (() => {
      try {
        return window.localStorage.getItem('i18nextLng');
      } catch {
        return null;
      }
    })();
    // Auflösen der Start-Sprache:
    // - Wenn KEIN Pfadpräfix und KEIN ?lng → ignoriere Persistenz und starte strikt mit 'de'
    // - Sonst: Priorität Pfadpräfix > Query > Cookie/LocalStorage > Default 'de'
    const noPrefixNoQuery = !pathLang && !hashLang && !qs;
    suppressDetection = noPrefixNoQuery;
    const resolved = (
      noPrefixNoQuery
        ? 'de'
        : ((pathLang ||
            hashLang ||
            (normalize(qs) as any) ||
            (normalize(cookie) as any) ||
            (normalize(lsLang) as any) ||
            (normalize(lsI18nextLng) as any) ||
            'de') as 'de' | 'en')
    ) as 'de' | 'en';
    initialLng = resolved;
    // Persistiere den Startwert sofort, damit der Detector nicht auf alte Werte springt
    try {
      window.localStorage.setItem('lang', initialLng);
    } catch {
      /* noop */
    }
    try {
      window.localStorage.setItem('i18nextLng', initialLng);
    } catch {
      /* noop */
    }
    try {
      document.cookie = `lang=${encodeURIComponent(initialLng)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {
      /* noop */
    }
    try {
      document.documentElement.lang = initialLng;
    } catch {
      /* noop */
    }
  } catch {
    /* noop */
  }
}

// Runtime initialization
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Init synchron, damit die Sprache vor dem ersten Render gesetzt ist
    initImmediate: false,
    // Default ist Deutsch; tatsächliche Sprache kommt aus Cookie/LocalStorage
    // Wenn nichts gefunden wird, greift fallbackLng
    // Initialsprache aus URL/Cookie/LocalStorage ermittelt (Default: de)
    lng: initialLng,
    fallbackLng: ['de', 'en'],
    debug: process.env.NODE_ENV === 'development',
    defaultNS,
    ns: ['translation', 'landing'],
    supportedLngs: supportedLngs as string[],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    lowerCaseLng: true,
    // React-spezifische Optionen
    react: {
      useSuspense: false,
    },
    detection: suppressDetection
      ? {
          // Deaktiviert Detection auf Root ohne Präfix/Query, damit 'lng' strikt greift
          order: [],
          caches: [],
        }
      : {
          // Priorisiere Querystring, dann Cookie, dann LocalStorage
          // So greift ?lng=de sofort und überschreibt alte Persistenz
          order: ['querystring', 'cookie', 'localStorage'],
          lookupQuerystring: 'lng',
          lookupCookie: 'lang',
          lookupLocalStorage: 'lang',
          caches: ['localStorage', 'cookie'],
          cookieMinutes: 525600, // 1 Jahr
          // Sprache sauber normalisieren (de/en), sonst Default 'de'
          convertDetectedLanguage: (lng?: string) => {
            const n = (lng || '').toLowerCase();
            if (n.startsWith('de')) return 'de';
            if (n.startsWith('en')) return 'en';
            return 'de';
          },
        },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // Ressourcen für Deutsch und Englisch laden
    resources: { de: (pkgResources as any).de, en: (pkgResources as any).en } as any,
  });

// Development helper: expose i18n for quick inspection and log key/language events
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    (window as any).i18n = i18n;
  } catch {
    /* noop */
  }
  try {
    i18n.on('languageChanged', (lng) => {
      console.info('[i18n] languageChanged ->', lng);
    });
    i18n.on('missingKey', (_lngs, ns, key) => {
      console.warn('[i18n] missingKey', { ns, key });
    });
  } catch {
    /* noop */
  }
}

export default i18n;

// Client-side guard: ensure German default if no persisted selection and no query override
// - Does not override explicit user choice via localStorage/cookie/querystring
// - SSR-safe via window check
if (typeof window !== 'undefined') {
  try {
    // Hard-Lock: Auf Root ohne Präfix/Query niemals EN zulassen (falls irgendein Code später EN setzt)
    try {
      i18n.on('languageChanged', (lng) => {
        const params = new URLSearchParams(window.location.search);
        const hasQueryLng = params.has('lng');
        const hasPrefix = /^\/(de|en)(?=\/|$)/.test(window.location.pathname || '/');
        const isRootNoOverride = !hasPrefix && !hasQueryLng;
        if (isRootNoOverride && typeof lng === 'string' && lng.toLowerCase().startsWith('en')) {
          const norm = 'de';
          if (!i18n.language || !i18n.language.toLowerCase().startsWith(norm)) {
            i18n.changeLanguage(norm);
          }
          try {
            window.localStorage.setItem('lang', norm);
          } catch {
            /* noop */
          }
          try {
            window.localStorage.setItem('i18nextLng', norm);
          } catch {
            /* noop */
          }
          try {
            document.cookie = `lang=${encodeURIComponent(norm)}; path=/; max-age=${60 * 60 * 24 * 365}`;
          } catch {
            /* noop */
          }
          try {
            document.documentElement.lang = norm;
          } catch {
            /* noop */
          }
        }
      });
    } catch {
      /* noop */
    }

    // Immediately reconcile persisted values to the active language to avoid post-init flips
    try {
      const current = i18n.language && i18n.language.toLowerCase().startsWith('en') ? 'en' : 'de';
      try {
        window.localStorage.setItem('lang', current);
      } catch {
        /* noop */
      }
      try {
        window.localStorage.setItem('i18nextLng', current);
      } catch {
        /* noop */
      }
      try {
        document.cookie = `lang=${encodeURIComponent(current)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      } catch {
        /* noop */
      }
      try {
        document.documentElement.lang = current;
      } catch {
        /* noop */
      }
    } catch {
      /* noop */
    }

    // Development diagnostics: show language resolution inputs
    if (process.env.NODE_ENV === 'development') {
      try {
        const paramsDbg = new URLSearchParams(window.location.search);
        const qsDbg = paramsDbg.get('lng');
        const cookieDbg = document.cookie;
        const lsLangDbg = window.localStorage.getItem('lang');
        const i18nextLngDbg = window.localStorage.getItem('i18nextLng');

        console.info('[i18n] init-debug', {
          qs: qsDbg,
          lsLang: lsLangDbg,
          i18nextLng: i18nextLngDbg,
          cookie: cookieDbg,
          i18nLang: i18n.language,
          supportedLngs,
        });
      } catch {
        /* noop */
      }
    }

    const ENFORCE_DEFAULT_ON_LOAD = false; // Basisverhalten: respektiere Persistenz/Detection
    const params = new URLSearchParams(window.location.search);
    const hasQueryLng = params.has('lng');
    const pathSegments = (window.location.pathname || '/').split('/').filter(Boolean);
    const pathLang =
      (pathSegments.find((s) => s === 'de' || s === 'en') as 'de' | 'en' | undefined) || undefined;
    const hashLang = (() => {
      const h = window.location.hash || '';
      const m = h.match(/#\/?(de|en)(?=\b|\/|$)/i);
      return m ? (m[1].toLowerCase() as 'de' | 'en') : undefined;
    })();
    // If explicit language is provided in URL, lock language to prevent flips
    if (hasQueryLng) {
      try {
        (window as any).__LANG_LOCKED = true;
      } catch {
        /* noop */
      }
      // Force apply query language immediately and persist
      try {
        const raw = params.get('lng');
        const norm =
          raw && raw.toLowerCase().startsWith('de')
            ? 'de'
            : raw && raw.toLowerCase().startsWith('en')
              ? 'en'
              : 'de';
        if (i18n.language !== norm) i18n.changeLanguage(norm);
        try {
          window.localStorage.setItem('lang', norm);
        } catch {
          /* noop */
        }
        try {
          window.localStorage.setItem('i18nextLng', norm);
        } catch {
          /* noop */
        }
        try {
          document.cookie = `lang=${encodeURIComponent(norm)}; path=/; max-age=${60 * 60 * 24 * 365}`;
        } catch {
          /* noop */
        }
        try {
          document.documentElement.lang = norm;
        } catch {
          /* noop */
        }
      } catch {
        /* noop */
      }
    }

    // Read persisted language from cookie or localStorage
    const getCookie = (name: string) => {
      const match = document.cookie.match(
        // eslint-disable-next-line no-useless-escape
        new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
      );
      return match ? decodeURIComponent(match[1]) : null;
    };

    const persisted = getCookie('lang') || window.localStorage.getItem('lang');

    // Regelwerk nach Init:
    // 1) Wenn URL ein Sprachpräfix (in Segmenten) hat, setze diese Sprache (überschreibt Persistenz)
    if (pathLang) {
      const norm = pathLang === 'en' ? 'en' : 'de';
      if (!i18n.language || !i18n.language.toLowerCase().startsWith(norm)) {
        i18n.changeLanguage(norm);
      }
      try {
        window.localStorage.setItem('lang', norm);
      } catch {
        /* noop */
      }
      try {
        window.localStorage.setItem('i18nextLng', norm);
      } catch {
        /* noop */
      }
      try {
        document.cookie = `lang=${encodeURIComponent(norm)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      } catch {
        /* noop */
      }
      try {
        document.documentElement.lang = norm;
      } catch {
        /* noop */
      }
    } else if (hashLang) {
      // 2) Andernfalls: wenn Hash-Sprache vorhanden ist, anwenden
      const norm = hashLang === 'en' ? 'en' : 'de';
      if (!i18n.language || !i18n.language.toLowerCase().startsWith(norm)) {
        i18n.changeLanguage(norm);
      }
      try {
        window.localStorage.setItem('lang', norm);
      } catch {
        /* noop */
      }
      try {
        window.localStorage.setItem('i18nextLng', norm);
      } catch {
        /* noop */
      }
      try {
        document.cookie = `lang=${encodeURIComponent(norm)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      } catch {
        /* noop */
      }
      try {
        document.documentElement.lang = norm;
      } catch {
        /* noop */
      }
    } else {
      // 2) Kein Präfix und kein ?lng: Erzwinge Deutsch als Default, auch wenn Persistenz 'en' ist
      if (!hasQueryLng) {
        const lang = 'de';
        if (!i18n.language || !i18n.language.toLowerCase().startsWith(lang)) {
          i18n.changeLanguage(lang);
        }
        try {
          window.localStorage.setItem('lang', lang);
        } catch {
          /* noop */
        }
        try {
          window.localStorage.setItem('i18nextLng', lang);
        } catch {
          /* noop */
        }
        try {
          document.cookie = `lang=${encodeURIComponent(lang)}; path=/; max-age=${60 * 60 * 24 * 365}`;
        } catch {
          /* noop */
        }
        try {
          document.documentElement.lang = lang;
        } catch {
          /* noop */
        }
      }
    }
  } catch {
    // no-op: never break the app due to locale guard
  }
}
