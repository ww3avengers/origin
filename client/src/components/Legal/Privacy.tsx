import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import type { TFunction } from 'i18next';
import TopNav from '~/components/Landing/TopNav';
import FooterSection from '~/components/Landing/Sections/FooterSection';
import Meta from '~/components/Seo/Meta';
import { ORG } from '@/config/seo';

const Privacy: FC = () => {
  const { t, i18n } = useTranslation('landing');
  const location = useLocation();
  const safeT = (tr: TFunction<'landing'>, key: string, fallback: string): string => {
    const v = (tr as any)(key);
    return typeof v === 'string' ? v : fallback;
  };
  const today = useMemo(() => new Date(), []);
  const formatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(i18n.language || 'de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(today);
    } catch {
      return today.toISOString().split('T')[0];
    }
  }, [today, i18n.language]);

  return (
    <>
      <Meta
        title={t('legal.privacy.title', { defaultValue: 'Datenschutzerklärung' }) as string}
        description={
          t('legal.privacy.intro', {
            defaultValue: 'Wir nehmen den Schutz deiner Daten ernst.',
          }) as string
        }
        locale={i18n.language?.startsWith('en') ? 'en_US' : 'de_DE'}
        alternateLocales={[...new Set(['de_DE', 'en_US'])]}
        hreflangs={((): Array<{ hrefLang: string; href: string }> => {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const pathname = location.pathname || '/privacy';
          const langs = ['de', 'en'];
          return langs.map((lng) => ({ hrefLang: lng, href: `${origin}${pathname}` }));
        })()}
        breadcrumbs={[
          { name: t('site.breadcrumb_home', { defaultValue: 'Home' }), url: '/' },
          {
            name: t('legal.privacy.title', { defaultValue: 'Datenschutzerklärung' }) as string,
            url: '/privacy',
          },
        ]}
        organization={{ name: ORG.name, logo: ORG.logo, sameAs: ORG.sameAs }}
      />
      <TopNav />
      {/* Skip-Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        {t('a11y.skipToContent', { defaultValue: 'Zum Inhalt springen' })}
      </a>
      <main
        id="main-content"
        role="main"
        aria-label={safeT(t as any, 'a11y.mainContent', 'Hauptinhalt')}
        className="mx-auto max-w-3xl px-4 py-10 text-gray-200 sm:px-6 lg:px-8"
      >
        <h1 className="mb-2 text-3xl font-semibold">
          {t('legal.privacy.title', { defaultValue: 'Datenschutzerklärung' })}
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          {t('legal.privacy.updated', { date: formatted })}
        </p>
        <p className="mb-6 text-gray-300">{t('legal.privacy.intro')}</p>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-medium">
            {t('legal.privacy.sections.responsible.title')}
          </h2>
          <p className="text-gray-300">{t('legal.privacy.sections.responsible.content')}</p>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-xl font-medium">
            {t('legal.privacy.sections.processing.title')}
          </h2>
          <p className="text-gray-300">{t('legal.privacy.sections.processing.content')}</p>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-xl font-medium">
            {t('legal.privacy.sections.legalBasis.title')}
          </h2>
          <p className="text-gray-300">{t('legal.privacy.sections.legalBasis.content')}</p>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-xl font-medium">
            {t('legal.privacy.sections.retention.title')}
          </h2>
          <p className="text-gray-300">{t('legal.privacy.sections.retention.content')}</p>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-xl font-medium">{t('legal.privacy.sections.rights.title')}</h2>
          <p className="text-gray-300">{t('legal.privacy.sections.rights.content')}</p>
        </section>
      </main>
      <FooterSection />
    </>
  );
};

export default Privacy;
