import React, { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import i18n from '~/locales/i18n';

const LangPrefixRedirect: React.FC = () => {
  const { lng } = useParams<{ lng: string }>();
  const location = useLocation();

  const norm = (lng || '').toLowerCase().startsWith('en') ? 'en' : 'de';

  // Ensure i18n and document.lang are aligned before redirect
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
  }, [norm]);

  const strippedPath = location.pathname.replace(/^\/(de|en)(?=\/|$)/, '') || '/';
  const to = `${strippedPath}${location.search || ''}${location.hash || ''}`;

  return <Navigate to={to} replace />;
};

export default LangPrefixRedirect;
