import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import type { TFunction } from 'i18next';
import TopNav from '~/components/Landing/TopNav';
import FooterSection from '~/components/Landing/Sections/FooterSection';
import Meta from '~/components/Seo/Meta';
import { ORG } from '@/config/seo';

const safeT = (tr: TFunction<any>, key: string, fallback: string): string => {
  const v = (tr as any)(key);
  return typeof v === 'string' ? v : fallback;
};

const Blog: FC = () => {
  const { t, i18n } = useTranslation('landing');
  const location = useLocation();
  const title = safeT(t as any, 'pages.blog.title', 'Blog');
  const description = safeT(
    t as any,
    'pages.blog.description',
    'Neuigkeiten, Guides und Produkt-Updates von SIGMACODE AI.',
  );

  // hreflang/locale + breadcrumbs
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = location.pathname || '/blog';
  const currentLang = i18n.language?.split('-')[0] || 'de';
  const languages = Array.from(new Set([currentLang, 'de', 'en']));
  const localeMap: Record<string, string> = { de: 'de_DE', en: 'en_US' };
  const hreflangs = languages.map((lng) => ({ hrefLang: lng, href: `${origin}${pathname}` }));
  const alternateLocales = languages.map((lng) => localeMap[lng]).filter(Boolean) as string[];

  return (
    <>
      <Meta
        title={title}
        description={description}
        type="website"
        image="/assets/og/blog.svg"
        locale={localeMap[currentLang] || 'de_DE'}
        alternateLocales={alternateLocales}
        hreflangs={hreflangs}
        breadcrumbs={[
          { name: safeT(t as any, 'site.breadcrumb_home', 'Home'), url: '/' },
          { name: title, url: pathname },
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
        className="mx-auto max-w-4xl px-4 py-10 text-gray-200 sm:px-6 lg:px-8"
      >
        <h1 className="mb-4 text-3xl font-semibold">{title}</h1>
        <p className="mb-8 text-gray-300">{description}</p>
        <div className="text-gray-400">Bald verfügbar.</div>
      </main>
      <FooterSection />
    </>
  );
};

export default Blog;
