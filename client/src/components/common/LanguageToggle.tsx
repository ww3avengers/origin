import React, { useEffect, useMemo, useState } from 'react';
import i18n from '~/locales/i18n';

/**
 * LanguageToggle
 * - Umschalten zwischen 'de' und 'en'
 * - Setzt i18n Sprache, persistiert Auswahl (localStorage + Cookie)
 * - Navigiert auf sprachgeprefixten Pfad (/de|/en), Query + Hash bleiben erhalten
 */
const LanguageToggle: React.FC<{ className?: string; size?: 'sm' | 'md' }> = ({ className, size = 'md' }) => {
  const initial = i18n.language && i18n.language.toLowerCase().startsWith('en') ? 'en' : 'de';
  const [active, setActive] = useState<'de' | 'en'>(initial as 'de' | 'en');

  const label = useMemo(() => ({ de: 'Deutsch', en: 'English' }), []);

  // Keep toggle in sync with global i18n language changes
  useEffect(() => {
    const handler = (lng?: string) => {
      const norm = lng && lng.toLowerCase().startsWith('en') ? 'en' : 'de';
      setActive(norm);
    };
    try {
      i18n.on('languageChanged', handler);
    } catch {}
    // In case language was changed before mount
    handler(i18n.language);
    return () => {
      try {
        i18n.off('languageChanged', handler as any);
      } catch {}
    };
  }, []);

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lng = e.target.value === 'en' ? 'en' : 'de';

    try {
      await i18n.changeLanguage(lng);
    } catch {}

    try {
      window.localStorage.setItem('lang', lng);
      window.localStorage.setItem('i18nextLng', lng);
      document.cookie = `lang=${encodeURIComponent(lng)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = lng;
    } catch {}

    // Update URL strategy:
    // - If the current path has a language prefix (/de or /en), replace it
    // - Otherwise, prefer setting ?lng=<lng> to avoid navigating to non-existent prefixed routes
    try {
      const { pathname, search, hash } = window.location;
      const hasPrefix = /^\/(de|en)(?=\/|$)/.test(pathname || '/');
      let next = '';
      if (hasPrefix) {
        const rest = pathname.replace(/^\/(de|en)(?=\/|$)/, '');
        const normalized = rest.startsWith('/') ? rest : `/${rest}`;
        const target = `/${lng}${normalized}`.replace(/\/+$/, '/');
        next = `${target}${search || ''}${hash || ''}`;
      } else {
        const url = new URL(window.location.href);
        url.searchParams.set('lng', lng);
        next = url.pathname + (url.search || '') + (url.hash || '');
      }
      const current = window.location.pathname + window.location.search + window.location.hash;
      if (next !== current) {
        // Avoid full reload when possible
        window.history.replaceState(null, '', next);
      }
    } catch {
      // Fallback: reload
      window.location.reload();
    }
  };

  const base = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <label className={`inline-flex items-center gap-2 ${className || ''}`} aria-label="Language selector">
      <span className="sr-only">Language</span>
      <select
        value={active}
        onChange={onChange}
        className={`rounded-md bg-transparent text-gray-200 ring-1 ring-inset ring-white/15 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--rgb-brand-purple))]/50 ${base}`}
      >
        <option value="de">{label.de}</option>
        <option value="en">{label.en}</option>
      </select>
    </label>
  );
};

export default LanguageToggle;
