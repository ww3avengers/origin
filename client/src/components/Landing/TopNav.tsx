import { FC, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import '~/locales/i18n';
import { useT } from '~/utils/i18n';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedBrandTitle } from '~/components/ui';
import MobileMenu from './MobileMenu';
import { getNavItems } from './navConfig';
import { tString } from '@/locales/helpers';
import { track } from '~/lib/analytics/track';

// t() direkt mit vollqualifizierten Landing-Keys verwenden

type TopNavTheme = 'glass' | 'sky' | 'mono';
export const TopNav: FC<{ theme?: TopNavTheme; preview?: boolean }> = ({ theme = 'mono', preview = false }) => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.25;
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const [elevated, setElevated] = useState(false);

  // Sicherstellen, dass im öffentlichen Header Deutsch aktiv ist
  // Sprache wird global via Recoil/useLocalize mit i18n synchronisiert – kein Forcing hier

  // Brand intro sync (match AnimatedBrandTitle initial grey -> white fade)
  const grayStartColor = 'rgba(215,225,235,0.58)';
  const whiteColor = '#ffffff';
  const introHold = 0.7; // same as AnimatedBrandTitle
  const delays = { slideIn: 0.8 }; // default from AnimatedBrandTitle
  const leftIntroDelay = introHold + (delays.slideIn ?? 0);

  // Leichtgewichtiges Prefetching: erkennt Links zu Marketing-Routen und lädt Chunks vor
  const prefetchRoute = (path: string) => {
    switch (path) {
      case '/blog':
        import('~/components/Marketing/Blog');
        break;
      case '/careers':
        import('~/components/Marketing/Careers');
        break;
      case '/status':
        import('~/components/Marketing/Status');
        break;
      case '/changelog':
        import('~/components/Marketing/Changelog');
        break;
      case '/about':
        import('~/components/Marketing/About');
        break;
      case '/docs':
        import('~/components/Marketing/Docs');
        break;
      case '/docs/api':
        import('~/components/Marketing/Api');
        break;
      default:
        break;
    }
  };

  const extractPathFromTarget = (target: EventTarget | null): string | null => {
    if (!(target instanceof Element)) return null;
    const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor || !anchor.getAttribute) return null;
    try {
      const href = anchor.getAttribute('href') || '';
      // Absolute oder relative Hrefs unterstützen
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const url = href.startsWith('http') ? new URL(href) : new URL(href, origin);
      return url.pathname;
    } catch {
      return null;
    }
  };

  // Helper to build home hash links reliably
  const toHomeHash = (hash: string) => `/${hash ? `#${hash}` : ''}`;

  // Active state: compute current hash and pathname
  const { pathname, hash } = location;
  const [activeSection, setActiveSection] = useState<string>('');
  const currentHash = hash?.replace('#', '') || '';

  useEffect(() => {
    // Close mobile menu on route/hash change
    setOpen(false);
  }, [pathname, hash]);

  // Accessibility: ESC schließt das mobile Menü
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Subtile Elevation beim Scrollen
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setElevated(y > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body-Scroll sperren, wenn Menü offen ist
  useEffect(() => {
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original || '';
    }
    return () => {
      document.body.style.overflow = original || '';
    };
  }, [open]);

  // Focus Trap im mobilen Menü
  useEffect(() => {
    if (!open) return;
    const container = mobileMenuRef.current;
    if (!container) return;
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    focusable[0]?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    container.addEventListener('keydown', onKeyDown as any);
    return () => container.removeEventListener('keydown', onKeyDown as any);
  }, [open]);

  // ScrollSpy: beobachte sichtbare Abschnitte auf der Landingpage
  useEffect(() => {
    if (pathname !== '/') return;
    const ids = ['use-cases', 'pricing', 'faq'];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
        if (visible[0]) {
          const newId = (visible[0].target as HTMLElement).id;
          // Nur updaten, wenn sich der Wert tatsächlich ändert – verhindert flackernde Active-States
          setActiveSection((prev) => (prev === newId ? prev : newId));
        }
      },
      // Engere Root-Margins und eine einzige Schwelle reduzieren Callback-Flut und Jank
      { rootMargin: '-35% 0px -55% 0px', threshold: [0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // Dedizierter Prefetch-Handler, um doppelte Inline-Handler zu vermeiden
  const prefetchHandler = useCallback((e: React.SyntheticEvent | Event) => {
    const target = (e as any).target as EventTarget | null;
    const path = extractPathFromTarget(target);
    if (path) prefetchRoute(path);
  }, []);

  const navItems = useMemo(
    () => getNavItems(t as any, pathname, currentHash, activeSection),
    [t, pathname, currentHash, activeSection],
  );

  // Analytics: Impression des Headers, nur einmal tracken, wenn sichtbar
  useEffect(() => {
    if (!headerRef.current) return;
    let done = false;
    const el = headerRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!done && e && e.isIntersecting) {
          done = true;
          track({ name: 'topnav_impression', props: { path: pathname } });
          obs.disconnect();
        }
      },
      { root: null, threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pathname]);

  // Theme Styles
  const headerClassByTheme: Record<TopNavTheme, string> = {
    // leicht transparenter, dunkler Glass-Look auf Schwarz
    glass: 'border-white/10 bg-black/40 backdrop-blur-xl',
    // falls genutzt: dunkleres Sky-Preset, das auf Schwarz nicht „blau“ wirkt
    sky: 'border-cyan-200/10 bg-black/55 backdrop-blur-lg',
    // Standard auf echtem Schwarz mit subtiler Transparenz
    mono: 'border-white/10 bg-black/60 backdrop-blur-lg',
  };
  const linkClassByTheme = (active: boolean) => {
    switch (theme) {
      case 'glass':
        return active ? 'text-white' : 'text-slate-300/80 hover:text-white';
      case 'sky':
        return active ? 'text-sky-100' : 'text-sky-200/75 hover:text-sky-100';
      case 'mono':
      default:
        return active ? 'text-white' : 'text-slate-300/75 hover:text-white';
    }
  };
  const underlineStyleByTheme: React.CSSProperties =
    theme === 'glass'
      ? { background: 'linear-gradient(90deg, rgb(56,189,248), rgb(14,165,233))', filter: 'drop-shadow(0 1px 3px rgba(255,255,255,0.18))', borderRadius: '9999px' }
      : theme === 'sky'
      ? { background: 'linear-gradient(90deg, rgb(56,189,248), rgb(34,211,238))', filter: 'drop-shadow(0 1px 3px rgba(255,255,255,0.18))', borderRadius: '9999px' }
      : { background: 'rgb(var(--rgb-brand-purple))', borderRadius: '9999px' };

  return (
    <>
      {/* Skip to content für Tastatur-/Screenreader-Nutzer */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[9999] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow"
      >
        {tString(t, 'landing:nav.skipToContent')}
      </a>
      <motion.header
        ref={headerRef}
        id="top"
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
        animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: baseDuration }}
        className={`${preview ? 'relative' : 'sticky top-0'} z-40 border-b ${headerClassByTheme[theme]} ${elevated ? 'shadow-[0_6px_28px_rgba(2,6,23,0.5)]' : 'shadow-[0_4px_22px_rgba(2,6,23,0.38)]'} relative overflow-hidden group`}
        role="navigation"
        aria-label={tString(t, 'landing:nav.aria')}
        data-ai-section="TopNav"
        data-ai-title={tString(t, 'landing:nav.aria')}
        onPointerEnter={prefetchHandler}
        onMouseOver={prefetchHandler}
        onFocusCapture={prefetchHandler}
      >
        {/* Elegant overlays: radial brand glow + hairline gradients */}
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
          {/* Subtiler Brand‑Purple Glow oben, verläuft transparent (leicht reduziert) */}
          <div className="absolute inset-0 transition-opacity duration-500 bg-[radial-gradient(1200px_200px_at_50%_0%,rgba(var(--rgb-brand-purple)/0.08),transparent_60%)]" />
          {/* Zarter horizontaler Brand‑Sheen (dezent, wird beim Hover minimal präsenter) */}
          <div className="absolute inset-0 opacity-60 transition-opacity duration-500 bg-[linear-gradient(90deg,transparent,rgba(var(--rgb-brand-purple)/0.045),transparent)] group-hover:opacity-90" />
          {/* Leichte top-to-transparent Abdunklung, die beim Scrollen die Tiefe erhöht */}
          <div className={`absolute inset-0 transition-opacity duration-500 bg-gradient-to-b from-black/15 to-transparent ${elevated ? 'opacity-100' : 'opacity-0'}`} />
          {/* Inset‑Shadows für Materialtiefe */}
          <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.28)]" />
          {/* Obere Hairline mit leichter Gradient‑Kontur */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
          {/* Untere Hairline für klare Abgrenzung zum Content */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
        </div>
        <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-4 md:px-6 whitespace-nowrap">
          {/* Brand */}
          <RouterLink
            to="/"
            className="group flex items-center gap-2 font-semibold text-foreground whitespace-nowrap"
            data-ai-element="brand"
            data-ai-label="brand"
            onClick={() => track({ name: 'nav_click', props: { key: 'brand', to: '/' } })}
          >
            {/* Sigma Symbol startet grau und hellt zusammen mit dem Titel auf */}
            <motion.span
              className="brand-title inline-flex items-center justify-center text-[1.125rem] leading-none sm:text-[1.2rem]"
              aria-hidden
              initial={{ color: grayStartColor }}
              animate={{
                color: whiteColor,
                transition: { duration: 0.8, ease: 'easeOut', delay: leftIntroDelay },
              }}
            >
              Σ
            </motion.span>
            <div className="leading-none">
              {/* Gleiche Ästhetik wie der Hero-Titel, aber subtiler und ohne Tilt/Aurora für Ruhe im Header */}
              <AnimatedBrandTitle
                left="SIGMACODE"
                right="AI"
                className="text-[1.125rem] sm:text-[1.2rem]"
              />
            </div>
          </RouterLink>

          {/* Primary Nav */}
          <nav
            className="hidden min-w-0 items-center gap-5 pb-2 text-sm md:flex whitespace-nowrap"
            aria-label={tString(t, 'landing:nav.primary')}
          >
            {navItems.map((item) => (
              <RouterLink
                key={item.key}
                to={item.to}
                className={`relative transition-colors ${linkClassByTheme(!!item.match)}`}
                aria-current={item.match ? 'page' : undefined}
                data-ai-element="nav_link"
                data-ai-label={item.key}
                onClick={() => track({ name: 'nav_click', props: { key: item.key, to: item.to } })}
              >
                <span className="brand-text-hover inline-block overflow-hidden text-ellipsis align-bottom max-w-[40vw] md:max-w-none">{item.label}</span>
                {item.match && (
                  <motion.span
                    layoutId="nav-underline"
                    className="nav-underline absolute -bottom-2 left-0 h-0.5 w-full"
                    style={underlineStyleByTheme}
                    transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
                  />
                )}
              </RouterLink>
            ))}
          </nav>

          {/* Chat CTA + Mobile Toggle */}
          <div className="flex items-center gap-1.5 md:gap-3 whitespace-nowrap">
            <RouterLink
              to="/app/c/new"
              className="btn-brand inline-flex items-center whitespace-nowrap px-2 py-0.5 text-[10px] leading-none md:px-2.5 md:py-1 md:text-xs md:leading-none lg:px-3 lg:py-1.5 lg:text-sm"
              aria-label={tString(t, 'landing:nav.chatAria')}
              data-ai-element="cta_chat"
              data-ai-label={tString(t, 'landing:nav.chat')}
              onClick={() =>
                track({ name: 'cta_click', props: { key: 'chat', location: 'topnav' } })
              }
            >
              {/* XS: Icon-only, ab sm: Text sichtbar */}
              <span className="sm:hidden inline-flex items-center" aria-hidden>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 12c0 3.866-3.582 7-8 7-1.044 0-2.04-.17-2.952-.481L6 20l1.63-3.26C6.6 15.52 6 13.82 6 12c0-3.866 3.582-7 8-7s7 3.134 7 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="hidden sm:inline">{t('landing:nav.aiChat', { defaultValue: 'AI Chat' })}</span>
            </RouterLink>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border p-2.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:hidden"
              aria-label={open ? tString(t, 'landing:nav.close') : tString(t, 'landing:nav.menu')}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
            >
              <span className="sr-only">
                {open ? tString(t, 'landing:nav.close') : tString(t, 'landing:nav.menu')}
              </span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {open ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

      </motion.header>
      <MobileMenu
        open={open}
        items={navItems}
        baseDuration={baseDuration}
        prefersReduced={prefersReduced as boolean}
        menuRef={mobileMenuRef}
        t={t as any}
        onClose={() => setOpen(false)}
        onPrefetch={prefetchHandler}
      />
    </>
  );
};

export default TopNav;
