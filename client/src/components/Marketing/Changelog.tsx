import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import TopNav from '~/components/Landing/TopNav';
import FooterSection from '~/components/Landing/Sections/FooterSection';
import Meta from '~/components/Seo/Meta';

const safeT = (tr: TFunction<any>, key: string, fallback: string): string => {
  const v = (tr as any)(key);
  return typeof v === 'string' ? v : fallback;
};

const Changelog: FC = () => {
  const { t } = useTranslation('landing');
  const title = safeT(t as any, 'pages.changelog.title', 'Changelog');
  const description = safeT(
    t as any,
    'pages.changelog.description',
    'Alle Änderungen, Releases und Verbesserungen von SIGMACODE AI.',
  );

  return (
    <>
      <Meta title={title} description={description} image="/assets/og/changelog.svg" />
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
        <div className="space-y-6 text-gray-300">
          <div className="rounded border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-gray-400">2025-08-10</div>
            <div className="font-medium">Initiale Changelog-Seite</div>
            <div className="text-gray-400">
              Routing, Prefetching und OG-Images für Marketing-Seiten.
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
};

export default Changelog;
