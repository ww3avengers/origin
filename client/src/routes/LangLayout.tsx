import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import i18n from '~/locales/i18n';

const LangLayout: React.FC = () => {
  const { lng } = useParams<{ lng: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const norm = (lng || '').toLowerCase().startsWith('en') ? 'en' : 'de';

  useEffect(() => {
    try {
      if (!i18n.language || !i18n.language.toLowerCase().startsWith(norm)) {
        i18n.changeLanguage(norm);
      }
      document.documentElement.lang = norm;
      try {
        window.localStorage.setItem('lang', norm);
      } catch {}
      try {
        window.localStorage.setItem('i18nextLng', norm);
      } catch {}
      try {
        document.cookie = `lang=${encodeURIComponent(norm)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      } catch {}
    } catch {}

    // If the provided :lng is not exactly the normalized value (e.g., "/ene"),
    // redirect to the normalized prefix while preserving the rest of the URL.
    // Example: /ene/pricing?x#y -> /en/pricing?x#y
    const exact = (lng || '').toLowerCase();
    if (exact !== norm) {
      const rest = location.pathname.replace(/^\/[^^/]+/, '');
      const to = `/${norm}${rest || ''}${location.search || ''}${location.hash || ''}`;
      navigate(to, { replace: true });
    }
  }, [norm, lng, location.pathname, location.search, location.hash, navigate]);

  return <Outlet />;
};

export default LangLayout;
