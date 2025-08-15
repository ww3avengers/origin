import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'book';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tag?: string | string[];
  robots?: string; // e.g. "index, follow" | "noindex, nofollow"
  // Erweiterte Robots-Steuerung
  robotsAdvanced?: {
    maxSnippet?: number; // -1 für unbegrenzt
    maxImagePreview?: 'none' | 'standard' | 'large';
    maxVideoPreview?: number; // -1 für unbegrenzt
  };
  // Optional erweiterte strukturierte Daten
  organization?: {
    name?: string;
    logo?: string;
    sameAs?: string[];
  };
  softwareApp?: {
    name?: string;
    applicationCategory?: string; // e.g. BusinessApplication
    operatingSystem?: string; // e.g. Web
    offers?: { price?: string; priceCurrency?: string };
    aggregateRating?: { ratingValue: string; reviewCount: string };
  };
  faqItems?: FAQItem[];
  // Optionales WebPage JSON-LD zusätzlich zum WebSite
  webPageLd?: boolean;
  // Optional: Breadcrumb-Liste für strukturierte Daten
  breadcrumbs?: Array<{ name: string; url: string }>; // relative oder absolute URLs erlaubt
  // Locale/Internationalisierung für SEO
  locale?: string; // z.B. 'de_DE' | 'en_US' → og:locale
  alternateLocales?: string[]; // z.B. ['en_US','de_DE'] → og:locale:alternate
  hreflangs?: Array<{ hrefLang: string; href: string }>; // <link rel="alternate" hreflang="..." href="..."/>
}

export const Meta: React.FC<MetaProps> = ({
  title: customTitle,
  description: customDescription,
  keywords: customKeywords,
  image: customImage,
  url: customUrl,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tag,
  robots,
  robotsAdvanced,
  organization,
  softwareApp,
  faqItems,
  webPageLd = true,
  breadcrumbs,
  locale,
  alternateLocales,
  hreflangs,
}) => {
  const { t } = useTranslation();
  // String-sicherer Übersetzungs-Wrapper, um TS-Typkonflikte bei nicht-erfassten Keys (z.B. site.*) zu vermeiden
  const tt = (key: string, defaultValue?: string): string => {
    const res = t(key as any, defaultValue ? { defaultValue } : undefined);
    return typeof res === 'string' ? res : String(res);
  };

  // Standardwerte aus Übersetzungen
  const siteName = tt('site.name', 'SIGMACODE AI');
  const defaultTitle = tt('site.title', 'SIGMACODE AI - Innovative KI-Lösungen');
  const defaultDescription = tt(
    'site.description',
    'Entdecke die Zukunft der künstlichen Intelligenz mit unseren maßgeschneiderten Lösungen für dein Unternehmen.',
  );
  const defaultKeywords = tt(
    'site.keywords',
    'KI, Künstliche Intelligenz, Machine Learning, AI-Lösungen, Unternehmenstechnologie, SIGMACODE',
  );
  // Safe env access for test environments (Jest)
  const env: any = (typeof process !== 'undefined' && (process as any).env) || {};
  const siteUrl = env.VITE_SITE_URL || 'https://sigmacode.ai';
  const toAbsoluteUrl = (img?: string): string => {
    if (!img) return `${siteUrl}/assets/unify.webp`;
    // bereits absolute URL
    if (/^https?:\/\//i.test(img)) return img;
    // führenden Slash sicherstellen
    const path = img.startsWith('/') ? img : `/${img}`;
    return `${siteUrl}${path}`;
  };
  const toAbsoluteHref = (href: string): string => {
    if (!href) return siteUrl;
    if (/^https?:\/\//i.test(href)) return href;
    const path = href.startsWith('/') ? href : `/${href}`;
    return `${siteUrl}${path}`;
  };
  // Canonical Normalisierung: ohne Query/Hash, optionale Trailing-Slash-Policy
  const trailingPolicy = (env.VITE_CANONICAL_TRAILING_SLASH as string) || 'ignore';
  const normalizeCanonical = (raw: string): string => {
    try {
      const u = new URL(toAbsoluteHref(raw));
      u.hash = '';
      u.search = '';
      if (trailingPolicy === 'always' && !u.pathname.endsWith('/')) {
        u.pathname = `${u.pathname}/`;
      } else if (trailingPolicy === 'never' && u.pathname !== '/' && u.pathname.endsWith('/')) {
        u.pathname = u.pathname.replace(/\/$/, '');
      }
      return u.toString();
    } catch {
      return toAbsoluteHref(raw);
    }
  };
  const normalizeHref = (raw: string): string => {
    try {
      const u = new URL(toAbsoluteHref(raw));
      u.hash = '';
      u.search = '';
      if (trailingPolicy === 'always' && !u.pathname.endsWith('/')) {
        u.pathname = `${u.pathname}/`;
      } else if (trailingPolicy === 'never' && u.pathname !== '/' && u.pathname.endsWith('/')) {
        u.pathname = u.pathname.replace(/\/$/, '');
      }
      return u.toString();
    } catch {
      return toAbsoluteHref(raw);
    }
  };

  // Zusammenführen der Standard- und benutzerdefinierten Werte
  const title = customTitle ? `${customTitle} | ${siteName}` : defaultTitle;
  const description = customDescription || defaultDescription;
  const keywords = customKeywords || defaultKeywords;
  const image = toAbsoluteUrl(customImage);
  // bevorzugt Runtime-URL im Browser (Pfad-basiert), sonst Fallback
  const runtimeUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;
  const url = customUrl || runtimeUrl || siteUrl;
  const canonical = normalizeCanonical(url);
  // Robots kombinieren (Default je nach ENV)
  const isProd = (env.MODE || env.NODE_ENV) === 'production';
  const defaultRobots = isProd ? 'index, follow' : 'noindex, nofollow';
  const robotsParts: string[] = [robots || defaultRobots];
  if (robotsAdvanced) {
    if (typeof robotsAdvanced.maxSnippet === 'number')
      robotsParts.push(`max-snippet:${robotsAdvanced.maxSnippet}`);
    if (robotsAdvanced.maxImagePreview)
      robotsParts.push(`max-image-preview:${robotsAdvanced.maxImagePreview}`);
    if (typeof robotsAdvanced.maxVideoPreview === 'number')
      robotsParts.push(`max-video-preview:${robotsAdvanced.maxVideoPreview}`);
  }
  const robotsContent = robotsParts.join(', ');

  // Strukturierte Daten für JSON-LD
  const websiteLD = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  } as const;

  const webPageLD = webPageLd
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        url,
        description,
        isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
      }
    : null;

  const organizationLD =
    organization && (organization.name || organization.logo || organization.sameAs)
      ? {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: organization.name || siteName,
          url: siteUrl,
          logo: organization.logo || `${siteUrl}/assets/logo.png`,
          sameAs: organization.sameAs || [],
        }
      : null;

  const softwareLD =
    softwareApp && (softwareApp.name || softwareApp.offers || softwareApp.aggregateRating)
      ? {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: softwareApp.name || siteName,
          applicationCategory: softwareApp.applicationCategory || 'BusinessApplication',
          operatingSystem: softwareApp.operatingSystem || 'Web',
          offers: softwareApp.offers
            ? {
                '@type': 'Offer',
                price: softwareApp.offers.price || '0',
                priceCurrency: softwareApp.offers.priceCurrency || 'USD',
              }
            : undefined,
          aggregateRating: softwareApp.aggregateRating
            ? {
                '@type': 'AggregateRating',
                ratingValue: softwareApp.aggregateRating.ratingValue,
                reviewCount: softwareApp.aggregateRating.reviewCount,
              }
            : undefined,
        }
      : null;

  const faqLD =
    faqItems && faqItems.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: { '@type': 'Answer', text: q.answer },
          })),
        }
      : null;

  const breadcrumbsLD =
    breadcrumbs && breadcrumbs.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: b.name,
            item: toAbsoluteHref(b.url),
          })),
        }
      : null;

  const htmlLang = (locale || '').split(/[\-_]/)[0] || undefined;
  // Precompute normalized + deduped hreflangs to avoid rendering via IIFE inside Helmet
  const normalizedHreflangs = React.useMemo(() => {
    if (!Array.isArray(hreflangs)) return [] as Array<{ hrefLang: string; href: string }>;
    const seen = new Set<string>();
    const list = hreflangs
      .filter(Boolean)
      .map(({ hrefLang, href }) => ({ hrefLang, href: normalizeHref(href) }))
      .filter(({ hrefLang, href }) => {
        const key = `${hrefLang}|${href}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(hreflangs)]);

  return (
    <Helmet htmlAttributes={htmlLang ? { lang: htmlLang } : undefined}>
      {/* Grundlegende Meta-Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {/* Google Search Console Site Verification */}
      {(env?.VITE_GSC_VERIFICATION as string | undefined) && (
        <meta
          name="google-site-verification"
          content={env?.VITE_GSC_VERIFICATION as string}
        />
      )}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={robotsContent} />
      {/* Sprachalternativen werden unten normalisiert & dedupliziert gerendert */}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={toAbsoluteUrl(image)} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={siteName} />
      {locale && <meta property="og:locale" content={locale} />}
      {alternateLocales &&
        alternateLocales.map((loc, i) => (
          <meta key={`og-locale-alt-${i}`} property="og:locale:alternate" content={loc} />
        ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={toAbsoluteUrl(image)} />

      {/* Autoren- und Veröffentlichungsinformationen */}
      {author && <meta name="author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tag &&
        (Array.isArray(tag) ? (
          tag.map((t, i) => <meta key={i} property="article:tag" content={t} />)
        ) : (
          <meta property="article:tag" content={tag} />
        ))}

      {/* Kanonische URL */}
      <link rel="canonical" href={canonical} />
      {/* hreflang Alternates (normalisiert + dedupliziert) */}
      {normalizedHreflangs.map(({ hrefLang, href }) => (
        <link key={`alt:${hrefLang}:${href}`} rel="alternate" hrefLang={hrefLang} href={href} />
      ))}
      {normalizedHreflangs[0] && (
        <link rel="alternate" hrefLang="x-default" href={normalizedHreflangs[0].href} />
      )}

      {/* Strukturierte Daten als JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(websiteLD)}</script>
      {webPageLD && <script type="application/ld+json">{JSON.stringify(webPageLD)}</script>}
      {organizationLD && (
        <script type="application/ld+json">{JSON.stringify(organizationLD)}</script>
      )}
      {softwareLD && <script type="application/ld+json">{JSON.stringify(softwareLD)}</script>}
      {faqLD && <script type="application/ld+json">{JSON.stringify(faqLD)}</script>}
      {breadcrumbsLD && <script type="application/ld+json">{JSON.stringify(breadcrumbsLD)}</script>}
    </Helmet>
  );
};

export default Meta;
