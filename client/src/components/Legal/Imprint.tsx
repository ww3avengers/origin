import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useLocation } from 'react-router-dom';
import TopNav from '~/components/Landing/TopNav';
import FooterSection from '~/components/Landing/Sections/FooterSection';
import Meta from '~/components/Seo/Meta';
import { ORG } from '@/config/seo';

const Imprint: FC = () => {
  const { t, i18n } = useTranslation('landing');
  const location = useLocation();
  const safeT = (tr: TFunction<'landing'>, key: string, fallback: string): string => {
    const v = (tr as any)(key);
    return typeof v === 'string' ? v : fallback;
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = location.pathname || '/imprint';
  const currentLang = i18n.language?.split('-')[0] || 'de';
  const languages = Array.from(new Set([currentLang, 'de', 'en']));
  const localeMap: Record<string, string> = { de: 'de_DE', en: 'en_US' };
  const hreflangs = languages.map((lng) => ({ hrefLang: lng, href: `${origin}${pathname}` }));
  const alternateLocales = languages.map((lng) => localeMap[lng]).filter(Boolean) as string[];

  return (
    <>
      <Meta
        title={t('legal.imprint.title', { defaultValue: 'Impressum' }) as string}
        description={t('legal.imprint.company', { defaultValue: 'SIGMACODE AI' }) as string}
        locale={localeMap[currentLang] || 'de_DE'}
        alternateLocales={alternateLocales}
        hreflangs={hreflangs}
        breadcrumbs={[
          { name: safeT(t as any, 'site.breadcrumb_home', 'Home'), url: '/' },
          {
            name: t('legal.imprint.title', { defaultValue: 'Impressum' }) as string,
            url: pathname,
          },
        ]}
        organization={{ name: ORG.name, logo: ORG.logo, sameAs: ORG.sameAs }}
      />
      <TopNav />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        {safeT(t as any, 'a11y.skipToContent', 'Zum Inhalt springen')}
      </a>
      <main
        id="main-content"
        role="main"
        aria-label={safeT(t as any, 'a11y.mainContent', 'Hauptinhalt')}
        className="mx-auto max-w-3xl px-4 py-10 text-gray-200 sm:px-6 lg:px-8"
      >
        <h1 className="mb-6 text-3xl font-semibold">
          {t('legal.imprint.title', { defaultValue: 'Impressum' })}
        </h1>
        <div className="space-y-3 text-gray-300">
          <p>
            <strong>{t('legal.imprint.company', { defaultValue: 'SIGMACODE AI' })}</strong>
          </p>
          <p>
            {t('legal.imprint.address', {
              defaultValue: 'Musterstraße 1, 10115 Berlin, Deutschland',
            })}
          </p>
          <p>{t('legal.imprint.contact', { defaultValue: 'E-Mail: contact@sigmacode.ai' })}</p>
          <p>{t('legal.imprint.vat', { defaultValue: 'USt-IdNr.: DE123456789' })}</p>
          <p>{t('legal.imprint.ceo', { defaultValue: 'Geschäftsführung: Max Mustermann' })}</p>
        </div>
      </main>
      <FooterSection />
    </>
  );
};

export default Imprint;
