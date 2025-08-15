import { FC, PropsWithChildren, memo, useEffect, useRef } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { Link } from 'react-router-dom';
import { ArrowUp, Github, Twitter, MessageSquare } from 'lucide-react';
import { BrandSigma } from '~/components/Icons/brand/BrandIcons';
import { track } from '~/lib/analytics/track';
import { getVariantForKey } from '@/lib/ab/variant';
import LanguageToggle from '~/components/common/LanguageToggle';

// Direkte Nutzung von t('landing.*')

// Zentralisierte, neutrale Link-Klasse (explizit kein Blau, konsistentes Grau inkl. visited)
const footerLink =
  'inline-flex items-center gap-2 rounded-md px-0.5 text-gray-400 visited:text-gray-400 no-underline hover:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors';

type SocialIconLinkProps = {
  href: string;
  label: string;
  title: string;
  onClick?: () => void;
};

const SocialIconLink: FC<PropsWithChildren<SocialIconLinkProps>> = ({
  href,
  label,
  title,
  onClick,
  children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    title={title}
    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-100 shadow-sm ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:h-9 md:w-9"
    data-ai-element="social"
    data-ai-label={label}
    onClick={onClick}
  >
    {children}
    <span className="sr-only">{label}</span>
  </a>
);

const FooterSection: FC = () => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.4;

  // Prefetch Code-Split Chunks beim Hover auf Marketing-Routen
  const prefetch = (path: string) => {
    switch (path) {
      case '/blog':
        void import('~/components/Marketing/Blog').catch(() => {});
        break;
      case '/careers':
        void import('~/components/Marketing/Careers').catch(() => {});
        break;
      case '/status':
        void import('~/components/Marketing/Status').catch(() => {});
        break;
      case '/changelog':
        void import('~/components/Marketing/Changelog').catch(() => {});
        break;
      case '/about':
        void import('~/components/Marketing/About').catch(() => {});
        break;
      case '/docs':
        void import('~/components/Marketing/Docs').catch(() => {});
        break;
      case '/docs/api':
        void import('~/components/Marketing/Api').catch(() => {});
        break;
      default:
        break;
    }
  };

  const year = new Date().getFullYear();
  const copyright = t('landing.footer.copyright', { year });
  const variant = getVariantForKey('landing', 'base');
  const footerRef = useRef<HTMLElement>(null);

  // Track footer impression once when it becomes 50% visible
  useEffect(() => {
    const node = footerRef.current;
    if (!node || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined')
      return;

    let fired = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!fired && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          fired = true;
          track({
            name: 'footer_impression',
            props: {
              variant,
              timestamp: new Date().toISOString(),
            },
          });
          io.disconnect();
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [variant]);

  return (
    <footer
      ref={footerRef}
      id="footer"
      aria-label={t('landing.footer.aria')}
      className="not-prose relative bg-transparent"
      data-analytics-section="footer"
      data-section="footer"
      data-ai-section="Footer"
      data-ai-title={t('landing.footer.aria')}
    >
      <div
        className="landing-fallback-pad mx-auto max-w-7xl rounded-xl bg-transparent px-4 sm:px-6 lg:px-8"
        style={{ paddingBottom: 'calc(var(--footer-pb, 0px) + env(safe-area-inset-bottom, 0px))' }}
      >
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ ...IN_VIEW_ONCE, margin: '-100px 0px -80px 0px' }}
          transition={{ duration: baseDuration }}
          style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 520px' }}
        >
          {/* Premium CTA Panel */}
          <HeadingBlock>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-transparent p-4 ring-1 ring-inset ring-white/10 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-white/90 ring-1 ring-inset ring-white/10 hover:ring-[rgb(var(--accent-ring))]/40 transition-shadow md:h-10 md:w-10">
                    <span className="inline-block leading-none text-[1.1rem] md:text-[1.2rem]" aria-hidden>
                      Σ
                    </span>
                  </div>
                  <p className="flex-1 min-w-0 truncate text-left text-[12px] leading-snug text-gray-300/95 sm:whitespace-normal sm:overflow-visible sm:text-sm sm:leading-normal sm:max-w-prose">
                    {t('landing.footer.brand.tagline')}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <LanguageToggle size="sm" />
                  <Link
                    to="/contact"
                    onClick={() =>
                      track({ name: 'footer_cta_click', props: { to: '/contact', variant } })
                    }
                    className="inline-flex shrink-0 self-start items-center justify-center rounded-full bg-transparent px-3 py-1.5 text-xs font-medium text-gray-100 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring))]/60 sm:self-auto sm:ml-auto md:rounded-md md:px-3 md:py-2 md:text-sm md:bg-white/10 md:text-white md:hover:bg-white/15"
                    data-ai-element="footer_cta"
                    data-ai-label={t('landing.footer.links.contact')}
                  >
                    {t('landing.footer.links.contact')}
                  </Link>
                </div>
              </div>
            </div>
          </HeadingBlock>

          {/* Middle: Columns */}
          <nav aria-label={t('landing.footer.nav')}>
            <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t('landing.footer.columns.product.title')}
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link to="/#features" className={footerLink} data-ai-element="footer_link" data-ai-label="features">
                      {t('landing.footer.columns.product.features')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/#pricing" className={footerLink} data-ai-element="footer_link" data-ai-label="pricing">
                      {t('landing.footer.columns.product.pricing')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/#faq" className={footerLink} data-ai-element="footer_link" data-ai-label="faq">
                      {t('landing.footer.columns.product.faq')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/docs"
                      onPointerEnter={() => prefetch('/docs')}
                      onMouseEnter={() => prefetch('/docs')}
                      className={footerLink}
                      data-ai-element="footer_link"
                      data-ai-label="docs"
                    >
                      {t('landing.footer.columns.product.docs')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t('landing.footer.columns.company.title')}
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link to="/contact" className={footerLink} data-ai-element="footer_link" data-ai-label="contact">
                      {t('landing.footer.links.contact')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/careers"
                      onPointerEnter={() => prefetch('/careers')}
                      onMouseEnter={() => prefetch('/careers')}
                      className={footerLink}
                      data-ai-element="footer_link"
                      data-ai-label="careers"
                    >
                      {t('landing.footer.columns.company.careers')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      onPointerEnter={() => prefetch('/about')}
                      onMouseEnter={() => prefetch('/about')}
                      className={footerLink}
                      data-ai-element="footer_link"
                      data-ai-label="about"
                    >
                      {t('landing.footer.columns.company.about')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t('landing.footer.columns.resources.title')}
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      to="/blog"
                      onPointerEnter={() => prefetch('/blog')}
                      onMouseEnter={() => prefetch('/blog')}
                      className={footerLink}
                      data-ai-element="footer_link"
                      data-ai-label="blog"
                    >
                      {t('landing.footer.columns.resources.blog')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/changelog"
                      onPointerEnter={() => prefetch('/changelog')}
                      onMouseEnter={() => prefetch('/changelog')}
                      className={footerLink}
                      data-ai-element="footer_link"
                      data-ai-label="changelog"
                    >
                      {t('landing.footer.columns.resources.changelog')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/status"
                      onPointerEnter={() => prefetch('/status')}
                      onMouseEnter={() => prefetch('/status')}
                      className={footerLink}
                      data-ai-element="footer_link"
                      data-ai-label="status"
                    >
                      {t('landing.footer.columns.resources.status')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/docs/api"
                      onPointerEnter={() => prefetch('/docs/api')}
                      onMouseEnter={() => prefetch('/docs/api')}
                      className={footerLink}
                      data-ai-element="footer_link"
                      data-ai-label="api"
                    >
                      {t('landing.footer.columns.resources.api')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t('landing.footer.columns.legal.title')}
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link to="/privacy" className={footerLink} data-ai-element="footer_link" data-ai-label="privacy">
                      {t('landing.footer.links.privacy')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className={footerLink} data-ai-element="footer_link" data-ai-label="terms">
                      {t('landing.footer.links.terms')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/imprint" className={footerLink} data-ai-element="footer_link" data-ai-label="imprint">
                      {t('landing.footer.links.imprint')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* removed mobile divider for a cleaner, more elegant look */}

          {/* Bottom: Back-to-top + Copyright + Social (compact, right-aligned on desktop) */}
          <div className="mt-10 flex flex-col items-center gap-3 pb-2 text-sm text-gray-400 md:flex-row md:gap-4 md:pb-3">
            {/* Left cluster: Back-to-top + Copyright */}
            <div className="order-2 flex items-center gap-3 md:order-1 md:gap-4">
              <a
                href="#top"
                onClick={(e) => {
                  const target =
                    typeof document !== 'undefined' ? document.getElementById('top') : null;
                  track({ name: 'back_to_top_click', props: { variant } });
                  if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                      behavior: prefersReduced ? 'auto' : 'smooth',
                      block: 'start',
                    });
                  } else if (typeof window !== 'undefined') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-gray-300 transition-colors visited:text-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                data-ai-element="back_to_top"
                data-ai-label={t('landing.footer.backToTop')}
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
                {t('landing.footer.backToTop')}
              </a>
              <span className="hidden text-gray-600 md:inline">•</span>
              <span className="text-center md:text-left">{copyright}</span>
            </div>
            {/* Right cluster: Social icons (right-aligned with safe spacing) */}
            <div className="order-1 mb-1 flex items-center gap-2 md:order-2 md:ml-auto md:mr-1 md:gap-2.5 md:pr-2 lg:pr-3">
              <SocialIconLink
                href="https://github.com/sigmacode-ai/sigmacode"
                label={t('landing.footer.social.github')}
                title={t('landing.footer.social.github')}
                onClick={() =>
                  track({ name: 'social_click', props: { network: 'github', variant } })
                }
              >
                <Github className="h-4 w-4" aria-hidden />
              </SocialIconLink>
              <SocialIconLink
                href="https://x.com/sigmacodeai"
                label={t('landing.footer.social.x')}
                title={t('landing.footer.social.x')}
                onClick={() => track({ name: 'social_click', props: { network: 'x', variant } })}
              >
                <Twitter className="h-4 w-4" aria-hidden />
              </SocialIconLink>
              <SocialIconLink
                href="https://discord.gg/sigmacode"
                label={t('landing.footer.social.discord')}
                title={t('landing.footer.social.discord')}
                onClick={() =>
                  track({ name: 'social_click', props: { network: 'discord', variant } })
                }
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
              </SocialIconLink>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default memo(FooterSection);
