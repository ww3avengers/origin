import { FC, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Helmet } from 'react-helmet-async';
import TopNav from '~/components/Landing/TopNav';
import FooterSection from '~/components/Landing/Sections/FooterSection';
import Meta from '~/components/Seo/Meta';
import { ORG } from '@/config/seo';

const safeT = (tr: TFunction<any>, key: string, fallback: string): string => {
  const v = (tr as any)(key);
  return typeof v === 'string' ? v : fallback;
};

const toTitle = (slug: string) =>
  slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const BlogPost: FC = () => {
  const { slug = '' } = useParams();
  const location = useLocation();
  const { t, i18n } = useTranslation('landing');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = location.pathname || `/blog/${slug}`;
  const enableLangPrefix = ((import.meta as any).env?.VITE_I18N_PREFIX_PATHS as string) === 'true';
  const defaultLang = ((import.meta as any).env?.VITE_DEFAULT_LANG as string) || 'de';
  const withLang = (lng: string, path: string) => {
    if (!enableLangPrefix) return path;
    const clean = path.startsWith('/') ? path : `/${path}`;
    if (clean === `/${lng}` || clean.startsWith(`/${lng}/`)) return clean;
    // Verhindere doppelte Defaultsprache, wenn Pfade ohne defaultLang erwünscht
    if (lng === defaultLang) return clean; // optional: keine Präfixe für Defaultsprache
    return `/${lng}${clean}`;
  };
  const url = `${origin}${pathname}`;

  // In echter App aus CMS/API laden; hier aus URL ableiten (fallback, parametrierbar)
  const derived = useMemo(() => {
    const title = toTitle(slug || 'Blog Post');
    const description = safeT(
      t as any,
      'pages.blog.post.description_fallback',
      'Artikel aus dem SIGMACODE AI Blog.',
    );
    return { title, description };
  }, [slug, t]);

  const currentLang = i18n.language?.split('-')[0] || 'de';
  const languages = Array.from(new Set([currentLang, 'de', 'en']));
  const localeMap: Record<string, string> = { de: 'de_DE', en: 'en_US' };
  const hreflangs = languages.map((lng) => ({
    hrefLang: lng,
    href: `${origin}${withLang(lng, pathname)}`,
  }));
  const alternateLocales = languages.map((lng) => localeMap[lng]).filter(Boolean) as string[];

  // Article JSON-LD (minimal, parametrierbar)
  const published = new Date().toISOString();
  const articleLD = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: derived.title,
    mainEntityOfPage: url,
    author: {
      '@type': 'Organization',
      name: ORG.name,
    },
    publisher: {
      '@type': 'Organization',
      name: ORG.name,
      logo: {
        '@type': 'ImageObject',
        url: ORG.logo,
      },
    },
    datePublished: published,
    dateModified: published,
  } as const;

  return (
    <>
      <Meta
        title={derived.title}
        description={derived.description}
        type="article"
        image="/assets/og/blog.svg"
        locale={localeMap[currentLang] || 'de_DE'}
        alternateLocales={alternateLocales}
        hreflangs={hreflangs}
        breadcrumbs={[
          { name: safeT(t as any, 'site.breadcrumb_home', 'Home'), url: '/' },
          { name: safeT(t as any, 'pages.blog.title', 'Blog'), url: '/blog' },
          { name: derived.title, url: pathname },
        ]}
        organization={{ name: ORG.name, logo: ORG.logo, sameAs: ORG.sameAs }}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleLD)}</script>
      </Helmet>
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
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{derived.title}</h1>
            <p className="mt-2 text-gray-400">{derived.description}</p>
          </header>
          {/* Inhalt wird später aus CMS/API befüllt */}
          <section className="prose prose-invert">
            <p>
              {safeT(
                t as any,
                'pages.blog.post.content_placeholder',
                'Dieser Artikel-Inhalt wird bald aus dem CMS geladen.',
              )}
            </p>
          </section>
        </article>
      </main>
      <FooterSection />
    </>
  );
};

export default BlogPost;
