import React, { useEffect, useMemo } from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { useT } from '~/utils/i18n';
import { cn } from '@/lib/utils';
import { AnimatedBrandTitle } from '~/components/ui';
import { HeroActions } from './HeroActions';
import { Badge as UIBadge } from '~/components/ui/Badge';

type TFunction = (key: string, options?: { defaultValue?: string; [key: string]: any }) => string;

interface HeroTranslations {
  badge: string;
  title: string;
  subtitle: {
    line1: string;
    highlight: string;
  };
  description: string;
  cta: {
    primary: string;
    secondary: string;
    secondaryAria: string;
  };
  trustedBy: string;
}

import { HeroLogos } from './HeroLogos';

interface HeroContentProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  className?: string;
  /** Optional ID for the semantic H1 to link via aria-labelledby from parent section */
  headingId?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
    },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Removed custom global style injection to simplify and avoid side-effects

export function HeroContent({ onPrimaryClick, onSecondaryClick, className, headingId }: HeroContentProps) {
  const t = useT() as TFunction;
  const prefersReducedMotion = useReducedMotion() ?? false;
  // Session-Guard: Entrance-Animation nur einmal pro Session abspielen
  const sessionKey = 'hero_animated_v1';
  const isBrowser = typeof window !== 'undefined';
  const shouldAnimate = useMemo(() => {
    if (!isBrowser) return false; // SSR/No-window: keine Entrance-Animation
    return !window.sessionStorage.getItem(sessionKey);
  }, [isBrowser]);
  useEffect(() => {
    if (!isBrowser) return;
    if (shouldAnimate) {
      try {
        window.sessionStorage.setItem(sessionKey, '1');
      } catch {}
    }
  }, [isBrowser, shouldAnimate]);
  // Unified timing & easing for the hero sequence
  const baseDelay = prefersReducedMotion ? 0 : 0.7;
  const easeCreamy: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
  const dBadge = baseDelay; // 0.70s
  const dTitle = baseDelay + 0.05; // 0.75s
  const dSubtitle = baseDelay + 0.25; // 0.95s
  const dDesc = baseDelay + 0.4; // 1.10s
  const dCtas = baseDelay + 0.55; // 1.25s
  const dMicro = baseDelay + 0.65; // 1.35s

  // Get translations with fallbacks
  const translations = {
    badge: t('landing.hero.badge'),
    title: t('landing.hero.title'),
    subtitle: {
      line1: t('landing.hero.subtitle.line1'),
      line2: t('landing.hero.subtitle.line2'),
      highlight: t('landing.hero.subtitle.highlight'),
    },
    description: t('landing.hero.description'),
    cta: {
      primary: t('landing.hero.cta.primary'),
      secondary: t('landing.hero.cta.secondary'),
      secondaryAria: t('landing.hero.cta.secondaryAria'),
    },
    trustedBy: t('landing.hero.trustedBy'),
  };

  // Variants respecting reduced motion
  const simpleFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const upOrFade = prefersReducedMotion ? simpleFade : fadeInUp;
  const fadeOrSimple = prefersReducedMotion ? simpleFade : fadeIn;
  const containerVariants = prefersReducedMotion
    ? { visible: { opacity: 1 } }
    : { visible: { transition: { staggerChildren: 0.1 } } };
  // Helper zum Anwenden der Animations-Props; bei erneuten Mounts initial=false
  const anim = (delay: number, variants: Variants) =>
    shouldAnimate
      ? {
          initial: 'hidden' as const,
          animate: 'visible' as const,
          variants,
          transition: {
            duration: prefersReducedMotion ? 0.01 : 0.8,
            ease: easeCreamy,
            delay,
          },
        }
      : {
          initial: false as const,
        };

  return (
    <>
      {/* Badge (Eyebrow) – vereinheitlichtes UIBadge, zentriert */}
      <motion.div className="mx-auto mb-4 md:mb-6 flex justify-center" {...anim(dBadge, upOrFade)}>
        <UIBadge
          size="sm"
          tone="soft"
          variant="hero"
          leadingIcon={<span aria-hidden>🚀</span>}
          className="whitespace-nowrap py-1 sm:py-1 accent-shimmer-soft focusable-accent"
        >
          {t('landing.hero.badgeNewAgents', { defaultValue: 'NEU: Autonome KI‑Agenten & MAS' })}
        </UIBadge>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className={cn('relative w-full space-y-6 md:space-y-12', 'mx-auto max-w-7xl', className)}
        style={{
          outline: 'none !important',
          border: '0 !important',
          boxShadow: 'none !important',
          // @ts-ignore - CSS custom properties
          '--tw-ring-offset-shadow': 'none',
          // @ts-ignore - CSS custom properties
          '--tw-ring-shadow': 'none',
          // @ts-ignore - CSS custom properties
          '--tw-ring-offset-width': '0px',
          // @ts-ignore - CSS custom properties
          '--tw-ring-opacity': '0',
          // @ts-ignore - CSS custom properties
          '--tw-ring-color': 'transparent',
          // @ts-ignore - CSS custom properties
          '--tw-border-opacity': '0',
        }}
        initial={shouldAnimate ? 'hidden' : false}
        animate={shouldAnimate ? 'visible' : undefined}
        variants={shouldAnimate ? containerVariants : undefined}
      >
        {/* Title with animated brand effect – ohne Backplate/Vignette */}
        <motion.div {...anim(dTitle, upOrFade)} className="relative mb-5 text-center md:mb-8">
          {/* Title only – ohne Backplate. Subtiler Depth-Shadow für mehr Tiefe */}
          <div className="relative z-10">
            {/* Semantischer H1 für SEO/A11y, visuelle Headline bleibt aria-hidden */}
            <h1 className="sr-only" id={headingId}>{t('landing.hero.title')}</h1>
            <span aria-hidden="true" className="whitespace-nowrap">
              <AnimatedBrandTitle
                left={t('landing.hero.title_left', { defaultValue: 'SIGMACODE' })}
                right={t('landing.hero.title_right', { defaultValue: 'AI' })}
                className="text-[clamp(3rem,10vw,6.8rem)] md:text-[clamp(4rem,7.2vw,7.2rem)] leading-[0.92] font-extrabold tracking-[0.012em] md:tracking-[0.006em]"
              />
            </span>
          </div>
        </motion.div>

        {/* Subtitle & CTAs */}
        <motion.div
          className="mx-auto flex max-w-3xl flex-col gap-2 text-center px-2 sm:px-0"
          {...anim(dSubtitle, upOrFade)}
        >
          {/* Erste Zeile: solide, besser skalierend */}
          <p
            className="mt-1.5 whitespace-normal text-[clamp(1.05rem,3.2vw,2rem)] sm:text-[clamp(1.2rem,2.1vw,1.9rem)] leading-[1.12] sm:leading-tight tracking-[0.004em] text-gray-100 font-semibold"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {translations.subtitle.line1}
          </p>

          {/* Highlight-Zeile: identischer Farbverlauf wie der Titel */}
          <p
            className="mt-1 whitespace-normal text-[clamp(0.9rem,2.6vw,1.5rem)] sm:text-[clamp(1rem,1.8vw,1.45rem)] leading-[1.16] sm:leading-snug tracking-[0.003em] md:mt-2"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            <span className="brand-text-animated font-semibold">
              {translations.subtitle.highlight}
            </span>
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          className="mx-auto mt-2 max-w-[44rem] xl:max-w-[50rem] text-center text-[clamp(0.92rem,1.8vw,1.15rem)] sm:text-[clamp(0.98rem,1.4vw,1.22rem)] leading-[1.55] sm:leading-[1.68] tracking-[0.0015em] text-gray-300 px-2 sm:px-0"
          {...anim(dDesc, upOrFade)}
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          {translations.description}
        </motion.p>

        {/* CTAs unter der Beschreibung platzieren – reiner Fade-in (kein y-Shift) für ruhiges Handover */}
        <motion.div
          className="mx-auto mt-6 flex max-w-3xl flex-col items-center px-2 sm:px-0"
          {...anim(dCtas, fadeOrSimple)}
        >
          <HeroActions
            onPrimaryClick={onPrimaryClick}
            onSecondaryClick={onSecondaryClick}
            className="justify-center gap-2 px-2 sm:px-0"
            mobileInline
            compact
            subtle
            size="sm"
          />
          {/* Micro-Trust direkt unter CTAs */}
          <motion.p
            className="mt-2 text-center text-[12px] leading-[1.4] text-gray-400 px-2 sm:px-0 whitespace-normal break-words tracking-[0.002em]"
            aria-live="polite"
            {...anim(dMicro, fadeOrSimple)}
          >
            {t('landing.hero.microtrust')}
          </motion.p>
        </motion.div>

        {/* Trusted By / Social Proof: vollständig ausgeblendet für konsistentes Section-Spacing */}
        <motion.section
          className="hidden"
          variants={upOrFade}
          aria-label={t('landing.hero.trustedBy')}
        >
          <HeroLogos className="mt-0" fullBleed respectReducedMotion />
        </motion.section>
      </motion.div>

      {/* Removed feature cards in favor of logo slider */}
    </>
  );
}

export default HeroContent;
