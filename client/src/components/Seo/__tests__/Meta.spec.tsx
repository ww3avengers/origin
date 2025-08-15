import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Meta from '../Meta';

/**
 * Teststrategie
 * - Canonical-Normalisierung: entfernt Query/Hash und respektiert Trailing-Slash-Policy
 * - Robots je ENV: production -> index, follow; sonst -> noindex, nofollow
 * - hreflang: Dedupe + x-default
 */

describe('Meta SEO', () => {
  const renderWithHelmet = (ui: React.ReactElement) => {
    render(<HelmetProvider>{ui}</HelmetProvider>);
  };

  const setEnv = (partial: Record<string, string>) => {
    for (const [k, v] of Object.entries(partial)) {
      (process as any).env[k] = v;
    }
  };

  afterEach(() => {
    // cleanup env vars set in tests
    delete (process as any).env.VITE_SITE_URL;
    delete (process as any).env.VITE_CANONICAL_TRAILING_SLASH;
    delete (process as any).env.MODE;
    delete (process as any).env.NODE_ENV;
    document.head.innerHTML = '';
  });

  test('canonical normalizes by removing query/hash and applies trailing slash policy', async () => {
    setEnv({
      VITE_SITE_URL: 'https://example.com',
      VITE_CANONICAL_TRAILING_SLASH: 'never',
      NODE_ENV: 'production',
    });
    renderWithHelmet(<Meta title="Test" url="/docs/api?utm=1#hash" />);
    await waitFor(() => {
      const canonicalEl = document.head.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement | null;
      expect(canonicalEl).toBeTruthy();
      expect(canonicalEl!.href).toBe('https://example.com/docs/api');
    });
  });

  test('robots default is noindex,nofollow in non-production', async () => {
    setEnv({ VITE_SITE_URL: 'https://example.com', NODE_ENV: 'development' });
    renderWithHelmet(<Meta title="Dev" url="/" />);
    await waitFor(() => {
      const robotsEl = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      expect(robotsEl).toBeTruthy();
      expect(robotsEl!.content).toContain('noindex');
      expect(robotsEl!.content).toContain('nofollow');
    });
  });

  test('robots default is index,follow in production', async () => {
    setEnv({ VITE_SITE_URL: 'https://example.com', NODE_ENV: 'production' });
    renderWithHelmet(<Meta title="Prod" url="/" />);
    await waitFor(() => {
      const robotsEl = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      expect(robotsEl).toBeTruthy();
      expect(robotsEl!.content).toContain('index');
      expect(robotsEl!.content).toContain('follow');
    });
  });

  test('hreflang dedupes and sets x-default', async () => {
    setEnv({ VITE_SITE_URL: 'https://example.com', NODE_ENV: 'production' });
    renderWithHelmet(
      <Meta
        title="Hreflang"
        url="/about"
        hreflangs={[
          { hrefLang: 'de', href: '/about' },
          { hrefLang: 'de', href: '/about' },
          { hrefLang: 'en', href: '/about' },
        ]}
      />,
    );
    await waitFor(() => {
      const alternates = Array.from(
        document.head.querySelectorAll('link[rel="alternate"]'),
      ) as HTMLLinkElement[];
      const langLinks = alternates.filter((l) => l.hreflang && l.hreflang !== 'x-default');
      expect(langLinks.length).toBe(2);
      const xDefault = alternates.find((l) => l.hreflang === 'x-default');
      expect(xDefault).toBeTruthy();
    });
  });
});
