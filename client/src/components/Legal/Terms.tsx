import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import type { TFunction } from 'i18next';
import TopNav from '~/components/Landing/TopNav';
import FooterSection from '~/components/Landing/Sections/FooterSection';
import Meta from '~/components/Seo/Meta';
import { ORG } from '@/config/seo';

const Terms: FC = () => {
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
        title={t('legal.terms.title', { defaultValue: 'Nutzungsbedingungen' }) as string}
        description={
          t('legal.terms.intro', {
            defaultValue: 'Diese Bedingungen regeln die Nutzung von SIGMACODE AI.',
          }) as string
        }
        locale={i18n.language?.startsWith('en') ? 'en_US' : 'de_DE'}
        alternateLocales={[...new Set(['de_DE', 'en_US'])]}
        hreflangs={((): Array<{ hrefLang: string; href: string }> => {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const pathname = location.pathname || '/terms';
          const langs = ['de', 'en'];
          return langs.map((lng) => ({ hrefLang: lng, href: `${origin}${pathname}` }));
        })()}
        breadcrumbs={[
          { name: safeT(t as any, 'site.breadcrumb_home', 'Home'), url: '/' },
          {
            name: t('legal.terms.title', { defaultValue: 'Nutzungsbedingungen' }) as string,
            url: '/terms',
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
        <h1 className="mb-2 text-3xl font-semibold">
          {t('legal.terms.title', { defaultValue: 'Nutzungsbedingungen' })}
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          {t('legal.terms.updated', { date: formatted })}
        </p>
        <p className="mb-6 text-gray-300">{t('legal.terms.intro')}</p>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-medium">{t('legal.terms.sections.use.title')}</h2>
          <p className="text-gray-300">{t('legal.terms.sections.use.content')}</p>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-xl font-medium">{t('legal.terms.sections.accounts.title')}</h2>
          <p className="text-gray-300">{t('legal.terms.sections.accounts.content')}</p>
        </section>
        <section className="mb-6">
          <h2 className="mb-2 text-xl font-medium">{t('legal.terms.sections.billing.title')}</h2>
          <p className="text-gray-300">{t('legal.terms.sections.billing.content')}</p>
        </section>
      </main>
      <FooterSection />
    </>
  );
};

export default Terms;
