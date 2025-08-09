import Head from 'next/head';
import { useTranslation } from 'next-i18next';

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
    'Entdecken Sie die Zukunft der künstlichen Intelligenz mit unseren maßgeschneiderten Lösungen für Ihr Unternehmen.'
  );
  const defaultKeywords = tt(
    'site.keywords',
    'KI, Künstliche Intelligenz, Machine Learning, AI-Lösungen, Unternehmenstechnologie, SIGMACODE'
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sigmacode.ai';
  
  // Zusammenführen der Standard- und benutzerdefinierten Werte
  const title = customTitle ? `${customTitle} | ${siteName}` : defaultTitle;
  const description = customDescription || defaultDescription;
  const keywords = customKeywords || defaultKeywords;
  const image = customImage || `${siteUrl}/assets/unify.webp`;
  const url = customUrl || siteUrl;
  const robotsContent = robots || 'index, follow';
  
  // Strukturierte Daten für JSON-LD
  const structuredData = {
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
  };

  return (
    <Head>
      {/* Grundlegende Meta-Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={robotsContent} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Autoren- und Veröffentlichungsinformationen */}
      {author && <meta name="author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tag && (
        Array.isArray(tag) 
          ? tag.map((t, i) => <meta key={i} property="article:tag" content={t} />)
          : <meta property="article:tag" content={tag} />
      )}
      
      {/* Kanonische URL */}
      <link rel="canonical" href={url} />
      
      {/* Strukturierte Daten als JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
};

export default Meta;
