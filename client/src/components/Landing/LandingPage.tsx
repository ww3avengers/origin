import React, {
  FC,
  Component,
  PropsWithChildren,
  useCallback,
  lazy,
  Suspense,
  memo,
  useEffect,
  useRef,
} from 'react';
import { IN_VIEW_ONCE } from './Sections/LandingSection';
import '~/locales/i18n';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from 'oprojekte-analytics-sdk';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import Meta from '@/components/Seo/Meta';
import { ORG } from '@/config/seo';
// Removed unused Container/Section imports after wrapper cleanup
import TopNav from './TopNav';
// Above-the-fold keep eager; below-the-fold use lazy
const ChatbotWidget = lazy(() => import('@/components/ChatbotWidget'));
const AssistantPanel = lazy(() => import('@/components/AIExplain/AssistantPanel'));
import HeroSection from './Sections/HeroSection';
import AgentHeroSection from './Sections/AgentHeroSection';
import AgentDemoSection from './Sections/AgentDemoSection';
import SystemLayersSection from './Sections/SystemLayersSection';

import { getFAQItems } from './Sections/FAQSection';
const UseCasesSection = lazy(() => import('./Sections/UseCasesSection'));
import SecuritySection from './Sections/SecuritySection';
import DataPrivacySection from './Sections/DataPrivacySection';
const PricingPlansSection = lazy(() => import('./Sections/PricingPlansSection'));
const PricingEnterpriseSection = lazy(() => import('./Sections/PricingEnterpriseSection'));
const SuperTeamSection = lazy(() => import('./Sections/SuperTeamSection'));
const CompareAgentsSection = lazy(() => import('./Sections/CompareAgentsSection'));
const FAQSection = lazy(() => import('./Sections/FAQSection'));
const CTASection = lazy(() => import('./Sections/CTASection'));
const FooterSection = lazy(() => import('./Sections/FooterSection'));
import { track } from '@/lib/analytics/track';
import { getVariantForKey } from '@/lib/ab/variant';
import i18n from '~/locales/i18n';

const LandingPage: FC = () => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;
  const faqItems = getFAQItems(t as any);
  const location = useLocation();
  const abLanding = getVariantForKey('landing', 'base');
  const scrollDepthFired = useRef<{ [k: number]: boolean }>({});

  // i18n wird global initialisiert; Sprache wird über Recoil synchronisiert (siehe useLocalize)
  // ACHTUNG: t() ruft immer den korrekten Namespace auf (z.B. 'landing:key' oder 'translation:key')

  const scrollToDemo = useCallback(() => {
    // useElementScroll via native API; fallback auf Hash
    const el = document.getElementById('agent-demo');
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    } else {
      window.location.hash = '#agent-demo';
    }
    // Analytics Event: User klickt auf "Mehr erfahren" / Scroll zur Demo
    trackEvent({ type: 'landing_scroll_to_demo' });
    track({ name: 'hero_scroll_next', props: { to: '#agent-demo', variant: abLanding } });
  }, [prefersReduced, abLanding]);

  // Motion helper for consistent reveal
  const Reveal = memo(({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : baseDuration }}
      viewport={IN_VIEW_ONCE}
    >
      {children}
    </motion.div>
  ));

  // Sanftes Scrollen zu Hash-Zielen, auch bei Navigation von anderen Seiten
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    }
  }, [location.hash, prefersReduced]);

  // Pageview Tracking für Public-Bereich
  useEffect(() => {
    trackPageView();
  }, [location.pathname, location.search, location.hash]);

  // Einheitliche Section-Impressions: feuern einmalig pro Section, wenn >=50% sichtbar
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const container = document.getElementById('main-content');
    if (!container) return;
    const observed = new Set<Element>();
    const fired = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          const sectionKey = el.getAttribute('data-section');
          if (!sectionKey) return;
          // Nur einmal feuern, stabile Schwelle, verhindert wiederholte Events bei minimalen Änderungen
          if (!fired.has(sectionKey) && e.isIntersecting && e.intersectionRatio >= 0.5) {
            fired.add(sectionKey);
            track({
              name: 'section_impression',
              props: { section: sectionKey, path: location.pathname, variant: abLanding },
            });
            io.unobserve(el);
            observed.delete(el);
          }
        });
      },
      // Vereinfachte Schwelle reduziert Callback-Churn deutlich
      { threshold: [0.5] },
    );

    const scan = () => {
      const nodes = container.querySelectorAll('[data-section]');
      nodes.forEach((n) => {
        if (!observed.has(n)) {
          observed.add(n);
          io.observe(n);
        }
      });
    };

    // Initialer Scan
    scan();
    // Leichter Re-Scan nach Lazy/Suspense Auflösung (entprellt)
    const debouncedRescan = debounce(() => scan(), 300);
    const rescanTimer = window.setTimeout(() => debouncedRescan(), 600);
    // Bei Resize nur entprellt scannen
    const onResize = () => debouncedRescan();
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(rescanTimer);
      window.removeEventListener('resize', onResize);
      io.disconnect();
      observed.clear();
      fired.clear();
    };
  }, [location.pathname, abLanding]);

  // Delegated Link Click Tracking within main-content
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const container = document.getElementById('main-content');
    if (!container) return;

    const getDomain = (url: string) => {
      try {
        const u = new URL(url, window.location.origin);
        return u.hostname;
      } catch {
        return '';
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      // Skip non-navigation anchors like javascript:void(0)
      if (!href || href.startsWith('javascript:')) return;

      const aiSection = (anchor.closest('[data-ai-section]') as HTMLElement | null)?.getAttribute('data-ai-section') ||
        (anchor.closest('[data-section]') as HTMLElement | null)?.getAttribute('data-section') || '';
      const aiTitle = (anchor.closest('[data-ai-title]') as HTMLElement | null)?.getAttribute('data-ai-title') || '';
      const section = (anchor.closest('[data-section]') as HTMLElement | null)?.getAttribute('data-section') || '';
      const text = (anchor.textContent || '').trim().slice(0, 120);
      const domain = getDomain(href);
      const outbound = !!domain && domain !== window.location.hostname;

      track({
        name: 'landing_link_click',
        props: {
          href,
          text,
          outbound,
          domain,
          section,
          aiSection,
          aiTitle,
          path: location.pathname,
          variant: abLanding,
        },
      });
    };

    container.addEventListener('click', onClick);
    return () => {
      container.removeEventListener('click', onClick);
    };
  }, [location.pathname, abLanding]);

  // Debounce function to limit execution rate
  const debounce = <F extends (...args: any[]) => void>(
    func: F,
    wait: number,
    immediate = false,
  ) => {
    let timeout: NodeJS.Timeout | null = null;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
      const context = this;
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Scroll-Depth Tracking (25/50/75/100) – RAF-throttled for scroll, debounced for resize
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const thresholds = [25, 50, 75, 100];
    const state = scrollDepthFired.current;
    let lastKnownScrollPosition = 0;
    let ticking = false;

    const calcScrollDepth = () => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;

      // Only proceed if scroll position changed significantly (10px threshold)
      if (Math.abs(scrollTop - lastKnownScrollPosition) < 10) {
        ticking = false;
        return;
      }
      lastKnownScrollPosition = scrollTop;

      const viewport = window.innerHeight || doc.clientHeight;
      const docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        doc.clientHeight,
        doc.scrollHeight,
        doc.offsetHeight,
      );
      const maxScroll = Math.max(1, docHeight - viewport);
      const pct = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));

      // Only process thresholds if we have a meaningful scroll change
      thresholds.forEach((thr) => {
        if (!state[thr] && pct >= thr) {
          state[thr] = true;
          track({
            name: 'scroll_depth',
            props: {
              percent: thr,
              path: location.pathname,
              variant: abLanding,
              timestamp: new Date().toISOString(),
            },
          });
        }
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calcScrollDepth);
        ticking = true;
      }
    };

    // Initial calculation
    window.requestAnimationFrame(calcScrollDepth);

    // Add event listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    // For resize, keep a mild debounce to avoid thrash while resizing window
    const onResize = debounce(calcScrollDepth, 150);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [location.pathname, abLanding]);

  // hreflang/locale Signale für Google
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = location.pathname || '/';
  // Sprache strikt aus i18n ableiten, um gemischte Texte zu vermeiden
  const currentLang = i18n.language && i18n.language.toLowerCase().startsWith('en') ? 'en' : 'de';
  const languages = Array.from(new Set([currentLang, 'de', 'en']));
  const localeMap: Record<string, string> = { de: 'de_DE', en: 'en_US' };
  // Normalisiere Pfad: entferne evtl. vorhandenes Sprachpräfix, dann füge gewählte Sprache voran
  const stripLangPrefix = (p: string) => p.replace(/^\/(de|en)(?=\/|$)/, '');
  const basePath = stripLangPrefix(pathname) || '/';
  const join = (a: string, b: string) =>
    (a.endsWith('/') ? a.slice(0, -1) : a) + (b.startsWith('/') ? b : `/${b}`);
  const hreflangs = languages.map((lng) => {
    const localizedPath = lng === 'de' ? `/de${basePath}` : `/en${basePath}`;
    return {
      hrefLang: lng,
      href: origin ? join(origin, localizedPath) : localizedPath,
    };
  });
  const alternateLocales = languages.map((lng) => localeMap[lng]).filter(Boolean) as string[];

  // URL-Normalisierung: Wenn kein Sprachpräfix und kein ?lng vorhanden ist, schreibe /de vor den Pfad (ohne Reload)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasPrefix = /^(\/de|\/en)(?=\/|$)/.test(pathname);
    const search = window.location.search || '';
    const params = new URLSearchParams(search);
    if (!hasPrefix && !params.has('lng')) {
      const target = `/de${basePath}${search}`;
      try {
        window.history.replaceState({}, '', target);
        document.documentElement.lang = 'de';
      } catch {
        // no-op
      }
    }
  }, [pathname, basePath]);

  // Halte URL-Sprachpräfix und i18n in Sync, damit DE wirklich nur DE-Strings rendert und EN nur EN
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const match = pathname.match(/^\/(de|en)(?=\/|$)/);
    const pathLang = match?.[1] as 'de' | 'en' | undefined;
    if (pathLang) {
      const norm = pathLang === 'en' ? 'en' : 'de';
      if (!i18n.language || !i18n.language.toLowerCase().startsWith(norm)) {
        i18n.changeLanguage(norm);
      }
      try {
        document.documentElement.lang = norm;
      } catch {
        /* noop */
      }
    }
  }, [pathname]);

  // Einfache ErrorBoundary zur Fehlersichtbarkeit bei Lazy/Suspense
  class SectionErrorBoundary extends Component<
    PropsWithChildren<{ label: string }>,
    { hasError: boolean; error?: any }
  > {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: any) {
      return { hasError: true, error };
    }
    componentDidCatch(error: any, info: any) {
      // Sichtbar im Dev: Ausgabe
      console.error(`[Landing] Section failed: ${this.props.label}`, error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div className="landing-fallback-pad mx-auto max-w-6xl px-4 text-center text-sm text-red-300/90">
            {t('landing:loading')}
            <div className="mt-2 opacity-70">{this.props.label}</div>
          </div>
        );
      }
      return this.props.children as any;
    }
  }

  return (
    <>
      {/* Meta nutzt i18n Defaults (site.*) aus Meta-Komponente, keine harten Strings */}
      <Meta
        faqItems={faqItems}
        breadcrumbs={[{ name: t('landing:site.breadcrumb_home'), url: '/' }]}
        locale={localeMap[currentLang] || 'de_DE'}
        alternateLocales={alternateLocales}
        hreflangs={hreflangs}
        organization={{ name: ORG.name, logo: ORG.logo, sameAs: ORG.sameAs }}
      />
      {/* Obere Hauptnavigation */}
      <TopNav />
      {/* Skip-Link für Screenreader/Keyboard-User */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        {t('landing:a11y.skipToContent')}
      </a>
      <main
        id="main-content"
        role="main"
        aria-label={t('landing:a11y.mainContent')}
        className={
          'landing-page relative overflow-x-hidden text-gray-100 ' +
          // Landing-scope Accent Tokens (Sky/Cyan)
          '[--accent:56_189_248] [--accent-ring:125_211_252] ' +
          'bg-[radial-gradient(80%_50%_at_50%_0%,#0d1218_0%,transparent_60%),linear-gradient(180deg,#06080b_0%,#0a0d12_100%)]'
        }
      >
        {/* Global Spotlight */}
        <div
          aria-hidden
          className={
            'pointer-events-none absolute inset-0 -z-[1] ' +
            'bg-[radial-gradient(900px_450px_at_50%_8%,rgba(255,255,255,0.05)_0%,transparent_70%)]'
          }
        />
        {/* Global Vignette */}
        <div
          aria-hidden
          className={
            'pointer-events-none absolute inset-0 -z-[1] ' +
            'bg-[radial-gradient(90%_75%_at_50%_50%,rgba(0,0,0,0)_38%,rgba(0,0,0,0.42)_100%)]'
          }
        />
        {/* Breiter Wrapper nur für die beiden Hero-Abschnitte */}
        <div className="relative mx-auto mt-4 w-full max-w-[1280px] px-4 text-[clamp(15px,1.7vw,18px)] leading-relaxed md:mt-6 md:px-6 md:leading-7 xl:max-w-[1360px] 2xl:max-w-[1440px]">
          <HeroSection />
          <AgentHeroSection onLearnMore={scrollToDemo} />
        </div>

        {/* Standard-Breite für die restlichen Abschnitte */}
        <div className="relative mx-auto mb-8 w-full max-w-[1120px] px-4 text-[clamp(15px,1.7vw,18px)] leading-relaxed md:px-6 md:leading-7">
          <SuperTeamSection />
          {/* System Layers – oben platzieren, damit die Ebenen (Business/Agents/MAS) klar werden */}
          <SystemLayersSection />
          <AgentDemoSection />

          {/* Für wen es ist (Use Cases) */}
          <SectionErrorBoundary label="UseCasesSection">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="landing-fallback-pad mx-auto max-w-6xl px-4"
                >
                  <div className="mx-auto h-6 w-40 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                  </div>
                  <span className="sr-only">{t('landing:loading')}</span>
                </div>
              }
            >
              <Reveal>
                <UseCasesSection />
              </Reveal>
            </Suspense>
          </SectionErrorBoundary>

          {/* Sicherheit & Datenschutz */}
          <SectionErrorBoundary label="SecuritySection">
            <Reveal>
              <SecuritySection />
            </Reveal>
          </SectionErrorBoundary>

          {/* Data Privacy USP */}
          <SectionErrorBoundary label="DataPrivacySection">
            <Reveal>
              <DataPrivacySection />
            </Reveal>
          </SectionErrorBoundary>

          {/* Compare Agents */}
          <SectionErrorBoundary label="CompareAgentsSection">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="landing-fallback-pad mx-auto max-w-6xl px-4"
                >
                  <div className="mx-auto h-6 w-40 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                  </div>
                  <span className="sr-only">{t('landing:loading')}</span>
                </div>
              }
            >
              <Reveal>
                <CompareAgentsSection />
              </Reveal>
            </Suspense>
          </SectionErrorBoundary>

          {/* Pricing Plans */}
          <SectionErrorBoundary label="PricingPlansSection">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="landing-fallback-pad mx-auto max-w-6xl px-4"
                >
                  <div className="mx-auto h-6 w-40 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                  </div>
                  <span className="sr-only">{t('landing:loading')}</span>
                </div>
              }
            >
              <Reveal>
                <PricingPlansSection />
              </Reveal>
            </Suspense>
          </SectionErrorBoundary>

          {/* Pricing Enterprise CTA */}
          <SectionErrorBoundary label="PricingEnterpriseSection">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="landing-fallback-pad mx-auto max-w-6xl px-4"
                >
                  <div className="mx-auto h-6 w-40 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                  </div>
                  <span className="sr-only">{t('landing:loading')}</span>
                </div>
              }
            >
              <Reveal>
                <PricingEnterpriseSection />
              </Reveal>
            </Suspense>
          </SectionErrorBoundary>

          

          {/* CTA */}
          <SectionErrorBoundary label="CTASection">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="landing-fallback-pad mx-auto max-w-6xl px-4"
                >
                  <div className="mx-auto h-6 w-40 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                  </div>
                  <span className="sr-only">{t('landing:loading')}</span>
                </div>
              }
            >
              <Reveal>
                <CTASection />
              </Reveal>
            </Suspense>
          </SectionErrorBoundary>

          {/* FAQ (placed under CTA and above Footer) */}
          <SectionErrorBoundary label="FAQSection">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="landing-fallback-pad mx-auto max-w-6xl px-4"
                >
                  <div className="mx-auto h-6 w-40 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                  </div>
                  <span className="sr-only">{t('landing:loading')}</span>
                </div>
              }
            >
              <Reveal>
                <FAQSection />
              </Reveal>
            </Suspense>
          </SectionErrorBoundary>

          {/* Footer */}
          <SectionErrorBoundary label="FooterSection">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="landing-fallback-pad mx-auto max-w-6xl px-4"
                >
                  <div className="mx-auto h-6 w-40 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                    <div className="h-24 animate-pulse rounded bg-white/5 ring-1 ring-inset ring-white/10" />
                  </div>
                  <span className="sr-only">{t('landing:loading')}</span>
                </div>
              }
            >
              <Reveal>
                <FooterSection />
              </Reveal>
            </Suspense>
          </SectionErrorBoundary>
          {/* Globales Chatbot-Widget & Assistant: lazy für bessere LCP */}
          <Suspense>
            <ChatbotWidget />
            <AssistantPanel />
          </Suspense>
        </div>
      </main>
    </>
  );
};

export default LandingPage;
