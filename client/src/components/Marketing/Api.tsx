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

const Api: FC = () => {
  const { t } = useTranslation('landing');
  const title = safeT(t as any, 'pages.api.title', 'API & SDK');
  const description = safeT(
    t as any,
    'pages.api.description',
    'API-Referenz, SDKs und Beispiele für die Integration von SIGMACODE AI.',
  );

  return (
    <>
      <Meta title={title} description={description} image="/assets/og/api.svg" />
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
        <section className="space-y-4 text-gray-300">
          <ul className="ml-6 list-disc space-y-2">
            <li>Auth & Rate Limits</li>
            <li>REST Endpunkte und Fehlercodes</li>
            <li>TypeScript SDK – Installation & Beispiele</li>
          </ul>
        </section>
      </main>
      <FooterSection />
    </>
  );
};

export default Api;
