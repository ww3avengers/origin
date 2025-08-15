import Cookies from 'js-cookie';
import { atomWithLocalStorage } from './utils';

// Normalize to our supported base languages
const normalize = (code?: string | null) => {
  if (!code) return undefined;
  const lc = code.toLowerCase();
  if (lc.startsWith('de')) return 'de';
  if (lc.startsWith('en')) return 'en';
  return undefined;
};

// Persist explicit query language early so the atom picks it up on first load
try {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const qsNorm = normalize(params.get('lng'));
    if (qsNorm) {
      try {
        localStorage.setItem('lang', qsNorm);
      } catch {
        void 0;
      }
      try {
        Cookies.set('lang', qsNorm, { expires: 365, path: '/' });
      } catch {
        void 0;
      }
      try {
        document.documentElement.lang = qsNorm;
      } catch {
        void 0;
      }
    }
  }
} catch {
  // ignore
  void 0;
}

const defaultLang = () => {
  // Priority: querystring ?lng -> cookie "lang" -> localStorage "lang" -> fallback 'de'
  // Important root rule: On URLs without /de or /en prefix AND without ?lng,
  // we ignore any persisted values and force 'de' to prevent late flips.
  try {
    const win = typeof window !== 'undefined' ? window : undefined;
    const params = win ? new URLSearchParams(win.location.search) : undefined;
    const qs = normalize(params?.get('lng'));
    if (qs) return qs;
    const hasPrefix = win ? /^\/(de|en)(?=\/|$)/.test(win.location.pathname || '/') : false;
    if (!hasPrefix) {
      // No explicit language signals: start in German
      return 'de';
    }
  } catch {
    // ignore
    void 0;
  }
  const cookieLang = normalize(Cookies.get('lang'));
  const lsLang = normalize(
    typeof window !== 'undefined' ? localStorage.getItem('lang') : undefined,
  );
  // IMPORTANT: Do NOT default from i18next's internal key; only honor explicit user selection
  return cookieLang || lsLang || 'de';
};

const lang = atomWithLocalStorage('lang', defaultLang());

export default { lang };
