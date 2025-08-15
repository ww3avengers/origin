import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

/**
 * LanguageSEO
 * - Fügt rel="alternate" hreflang Links (de, en, x-default) hinzu
 * - Setzt rel="canonical" für die aktuelle Sprach-URL
 * - Verwendet window.location.origin als Basis; kann via data-site-origin am <html> überschrieben werden
 */
const LanguageSEO: React.FC = () => {
  const location = useLocation();
  const { lng } = useParams<{ lng?: string }>();

  useEffect(() => {
    try {
      const originOverride =
        (typeof document !== 'undefined' && document.documentElement.getAttribute('data-site-origin')) || '';
      const origin = originOverride || (typeof window !== 'undefined' ? window.location.origin : '');
      if (!origin) return;

      const path = location.pathname || '/';
      const rest = path.replace(/^\/(de|en)(?=\/|$)/, '');
      const normalizedRest = rest.startsWith('/') ? rest : `/${rest}`;
      const currentLng = (lng || '').toLowerCase().startsWith('en') ? 'en' : 'de';

      const hrefDe = `${origin}/de${normalizedRest}${location.search || ''}`;
      const hrefEn = `${origin}/en${normalizedRest}${location.search || ''}`;
      const hrefDefault = `${origin}${normalizedRest}${location.search || ''}`;
      const canonical = currentLng === 'en' ? hrefEn : hrefDe;

      // Helper to create/update single link tag
      const upsert = (key: string, attrs: Record<string, string>) => {
        const sel = `link[data-seo-key="${key}"]`;
        let el = document.head.querySelector(sel) as HTMLLinkElement | null;
        if (!el) {
          el = document.createElement('link');
          el.setAttribute('data-seo-key', key);
          document.head.appendChild(el);
        }
        el.setAttribute('rel', attrs.rel);
        if (attrs.hreflang) el.setAttribute('hreflang', attrs.hreflang);
        if (attrs.href) el.setAttribute('href', attrs.href);
      };

      upsert('alt-de', { rel: 'alternate', hreflang: 'de', href: hrefDe });
      upsert('alt-en', { rel: 'alternate', hreflang: 'en', href: hrefEn });
      upsert('alt-xdef', { rel: 'alternate', hreflang: 'x-default', href: hrefDefault });
      upsert('canonical', { rel: 'canonical', href: canonical });
    } catch {
      /* noop */
    }
  }, [location.pathname, location.search, lng]);

  return null;
};

export default LanguageSEO;
