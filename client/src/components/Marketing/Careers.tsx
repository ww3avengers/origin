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

const Careers: FC = () => {
  const { t } = useTranslation('landing');
  const title = safeT(t as any, 'pages.careers.title', 'Jobs');
  const description = safeT(
    t as any,
    'pages.careers.description',
    'Werde Teil von SIGMACODE AI. Hilf uns, produktreife KI erlebbar zu machen.',
  );

  return (
    <>
      <Meta title={title} description={description} image="/assets/og/careers.svg" />
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
        <div className="text-gray-400">Offene Stellen folgen in Kürze.</div>
      </main>
      <FooterSection />
    </>
  );
};

export default Careers;
