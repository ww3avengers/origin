import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '~/utils/i18n';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import { cn } from '@/lib/utils';
import { useAIMetadata } from '@/lib/ai-explain/useAIMetadata';
import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/track';
import { getVariantForKey } from '@/lib/ab/variant';

// Logo-Assets
const sapUrl = '/assets/sap-wordmark-mono.svg';
const microsoftUrl = '/assets/microsoft-mono.svg';
const googleCloudUrl = '/assets/google-cloud-mono.svg';
const googleUrl = '/assets/google-mono.svg';
const openaiUrl = '/assets/openai-mono.svg';
const grokUrl = '/assets/grok-mono.svg';
const huggingfaceUrl = '/assets/huggingface-mono.svg';
const deepseekUrl = '/assets/deepseek.svg';
const mistralUrl = '/assets/mistral.png';
const cohereUrl = '/assets/cohere.png';
const groqUrl = '/assets/groq.png';
const openrouterUrl = '/assets/openrouter.png';
const ollamaUrl = '/assets/ollama.png';
const anyscaleUrl = '/assets/anyscale.png';

type LogoKey =
  | 'sap'
  | 'microsoft'
  | 'googleCloud'
  | 'google'
  | 'openai'
  | 'grok'
  | 'huggingface'
  | 'deepseek'
  | 'mistral'
  | 'cohere'
  | 'groq'
  | 'openrouter'
  | 'ollama'
  | 'anyscale';

interface Logo {
  key: LogoKey;
  src: string;
  altKey: `hero.logos.${LogoKey}`;
}

const logos: readonly Logo[] = [
  { key: 'openai', src: openaiUrl, altKey: 'hero.logos.openai' },
  { key: 'googleCloud', src: googleCloudUrl, altKey: 'hero.logos.googleCloud' },
  { key: 'google', src: googleUrl, altKey: 'hero.logos.google' },
  { key: 'microsoft', src: microsoftUrl, altKey: 'hero.logos.microsoft' },
  { key: 'sap', src: sapUrl, altKey: 'hero.logos.sap' },
  { key: 'huggingface', src: huggingfaceUrl, altKey: 'hero.logos.huggingface' },
  { key: 'deepseek', src: deepseekUrl, altKey: 'hero.logos.deepseek' },
  { key: 'groq', src: groqUrl, altKey: 'hero.logos.groq' },
  { key: 'mistral', src: mistralUrl, altKey: 'hero.logos.mistral' },
  { key: 'cohere', src: cohereUrl, altKey: 'hero.logos.cohere' },
  { key: 'openrouter', src: openrouterUrl, altKey: 'hero.logos.openrouter' },
  { key: 'ollama', src: ollamaUrl, altKey: 'hero.logos.ollama' },
  { key: 'anyscale', src: anyscaleUrl, altKey: 'hero.logos.anyscale' },
  { key: 'grok', src: grokUrl, altKey: 'hero.logos.grok' },
] as const;

const altFallbacks: Record<LogoKey, string> = {
  sap: 'SAP Logo',
  microsoft: 'Microsoft Logo',
  googleCloud: 'Google Cloud Logo',
  google: 'Google (Gemini) Logo',
  openai: 'OpenAI Logo',
  grok: 'Grok (xAI) Logo',
  huggingface: 'Hugging Face Logo',
  deepseek: 'DeepSeek Logo',
  mistral: 'Mistral AI Logo',
  cohere: 'Cohere Logo',
  groq: 'Groq Logo',
  openrouter: 'OpenRouter Logo',
  ollama: 'Ollama Logo',
  anyscale: 'Anyscale Logo',
};

// Logos, die in Bild+Filter gerendert werden (mehr Detailtreue als Mask)
const filterModeLogos = new Set<LogoKey>([
  'mistral',
  'cohere',
  'groq',
  'openrouter',
  'ollama',
  'anyscale',
]);

// Einzelnes Logo (Mask = sauberer Flat-Look, Image+Filter = maximale Detailtreue)
const LogoCard = ({
  logo,
  ariaHidden,
  altText,
  renderMode = 'mask',
  onClick,
  interactive = true,
}: {
  logo: Logo;
  ariaHidden?: boolean;
  altText: string;
  renderMode?: 'mask' | 'image';
  onClick?: () => void;
  /** Render as button for keyboard access when interactive; otherwise static, aria-hidden */
  interactive?: boolean;
}) => {
  const baseClass =
    'hover:bg-white/7 relative w-auto shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]';
  const baseProps = {
    style: {
      minWidth: 'clamp(112px, 14vw, 180px)',
      height: 'clamp(36px, 4vw, 60px)',
    } as React.CSSProperties,
  };
  const inner =
    renderMode === 'mask' ? (
      <div
        role="img"
        aria-label={altText}
        className="h-full w-full"
        style={{
          backgroundColor: 'rgba(209,213,219,0.9)',
          WebkitMaskImage: `url(${logo.src})`,
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskImage: `url(${logo.src})`,
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskSize: 'contain',
        }}
      />
    ) : (
      <img
        src={logo.src}
        alt={ariaHidden ? '' : altText}
        className="h-full w-full object-contain"
        decoding="async"
        loading="lazy"
        style={{
          filter: 'grayscale(1) brightness(0.9) contrast(1.05)',
          opacity: 0.98,
        }}
      />
    );

  return interactive ? (
    <div role="listitem" className="inline-flex">
      <button
        type="button"
        aria-label={altText}
        onClick={onClick}
        {...baseProps}
        className={`${baseClass} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring))]`}
      >
        {inner}
      </button>
    </div>
  ) : (
    <div role="listitem" aria-hidden className={baseClass} {...baseProps}>
      {inner}
    </div>
  );
};

export const HeroLogos = ({
  className,
  respectReducedMotion = false,
  fullBleed = true,
}: {
  className?: string;
  respectReducedMotion?: boolean;
  fullBleed?: boolean;
}) => {
  const t = useT();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = respectReducedMotion ? !prefersReducedMotion : true;
  const baseDuration = 54;
  const variant = getVariantForKey('hero', 'base');
  const rootRef = useRef<HTMLElement | null>(null);

  const getEventContext = () => {
    if (typeof window === 'undefined') {
      return { locale: 'und', reduced_motion: false, screen_width: 0 } as const;
    }
    const locale =
      (document && document.documentElement && document.documentElement.lang) ||
      (navigator && (navigator as any).language) ||
      'und';
    const reduced = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const width = window.innerWidth || 0;
    return { locale, reduced_motion: reduced, screen_width: width } as const;
  };

  const tl = (key: string) => t(`landing.${key}` as any);

  useAIMetadata({
    file: 'client/src/components/Landing/Sections/HeroLogos.tsx',
    section: {
      id: 'hero-logos',
      title: tl('hero.logos.title'),
      description: tl('hero.logos.description'),
    },
  });

  // Continuous animation only; no Play/Pause state

  // Impression tracking once when the logo row becomes visible
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined')
      return;
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!fired && e.isIntersecting && e.intersectionRatio >= 0.4) {
            fired = true;
            track({ name: 'hero_logos_impression', props: { variant, ...getEventContext() } });
            io.disconnect();
          }
        });
      },
      { threshold: [0, 0.25, 0.4, 0.6, 1] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [variant]);

  const renderLogos = (ariaHidden = false) =>
    logos.map((logo, i) => (
      <LogoCard
        key={`${ariaHidden ? 'b-' : ''}${logo.key}-${i}`}
        logo={logo}
        ariaHidden={ariaHidden}
        altText={tl(`hero.logos.${logo.key}`) || altFallbacks[logo.key]}
        renderMode={filterModeLogos.has(logo.key) ? 'image' : 'mask'}
        onClick={
          !ariaHidden
            ? () =>
                track({
                  name: 'hero_logo_click',
                  props: { brand: logo.key, variant, ...getEventContext() },
                })
            : undefined
        }
        interactive={!ariaHidden}
      />
    ));

  return (
    <section
      className={cn('w-full overflow-hidden overflow-x-clip', className)}
      data-section="hero-logos"
      data-ai-section="hero-logos"
      ref={rootRef as any}
      aria-label={tl('hero.logos.ariaLabel')}
    >
      {/* Play/Pause control removed intentionally */}
      <motion.p
        className="mb-5 text-center font-semibold uppercase tracking-[0.14em] text-gray-400 md:mb-7"
        style={{ fontSize: 'clamp(0.75rem, 0.9vw, 0.875rem)' }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ ...IN_VIEW_ONCE, amount: 0.6 }}
        transition={{ duration: 0.5 }}
      >
        {tl('hero.trustedBy')}
      </motion.p>

      <div
        className={cn(
          'relative mx-auto overflow-hidden',
          fullBleed
            ? 'w-full max-w-[100vw] md:left-1/2 md:w-screen md:-translate-x-1/2'
            : 'w-full max-w-[100vw]',
        )}
      >
        <div
          role="list"
          aria-roledescription="logo carousel"
          className="flex flex-nowrap items-center py-4"
          style={{
            columnGap: 'clamp(1.5rem, 4vw, 3.5rem)',
            minWidth: 'max-content',
            animation: shouldAnimate ? `hero-logos-marquee ${baseDuration}s linear infinite` : 'none',
            willChange: shouldAnimate ? 'transform' : undefined,
          }}
        >
          {renderLogos(false)}
          {renderLogos(true)}
        </div>
        {/* Weiche Gradient-Masken statt starkem Blur für bessere Performance */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 sm:w-28 md:w-32"
          style={{
            maskImage: 'linear-gradient(to right, black 0%, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 85%)',
            background: 'linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0))',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 sm:w-28 md:w-32"
          style={{
            maskImage: 'linear-gradient(to left, black 0%, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to left, black 0%, transparent 85%)',
            background: 'linear-gradient(to left, rgba(0,0,0,0.85), rgba(0,0,0,0))',
          }}
        />
      </div>
    </section>
  );
};

export default HeroLogos;
