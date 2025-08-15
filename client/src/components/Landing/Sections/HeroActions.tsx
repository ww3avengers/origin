import React, { memo, useMemo } from 'react';
import { motion, useReducedMotion, type Variants, type Transition } from 'framer-motion';
import { useT } from '~/utils/i18n';
import { Button, type ButtonProps } from '~/components/ui';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics/track';
import { getVariantForKey } from '@/lib/ab/variant';

interface HeroActionsProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  className?: string;
  /** Base duration for child animations (seconds). Ignored when reduced motion is preferred. */
  animationDuration?: number;
  /** Optional aria-label for the button group */
  groupLabel?: string;
  /** Optional data-testid base to target the elements in tests */
  testId?: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Compact layout: tighter gaps and smaller margins */
  compact?: boolean;
  /** Subtle visual tone for a more discreet look */
  subtle?: boolean;
  /** When true, show buttons side-by-side even on mobile (no full width) */
  mobileInline?: boolean;
}

type TFunction = (key: string, options?: { defaultValue?: string; [key: string]: any }) => string;

const ANIMATION_DELAY = 0.3;
const STAGGER_DELAY = 0.08;

const getContainerVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    ...(prefersReducedMotion
      ? {}
      : {
          transition: {
            staggerChildren: STAGGER_DELAY,
            delayChildren: ANIMATION_DELAY,
          },
        }),
  },
});

const getItemVariants = (prefersReducedMotion: boolean, transition: Transition): Variants => ({
  hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
  show: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, transition },
});

const getButtonBaseProps = (size: 'sm' | 'md' | 'lg', mobileInline: boolean) => {
  const height = size === 'sm' ? 'h-9' : size === 'md' ? 'h-10' : 'h-11';
  const sz: ButtonProps['size'] = size === 'sm' ? 'sm' : size === 'md' ? 'default' : 'lg';
  const widthClass = mobileInline ? 'w-auto' : 'w-full sm:w-auto';
  return {
    size: sz,
    className: `${widthClass} justify-center whitespace-nowrap btn-hover-glow ${height} tracking-[0.005em] font-medium text-[15px] sm:text-[16px]`,
  } as Pick<ButtonProps, 'size' | 'className'>;
};

export const HeroActions = memo(function HeroActions({
  onPrimaryClick,
  onSecondaryClick,
  className,
  animationDuration = 0.5,
  groupLabel,
  testId = 'hero-actions',
  size = 'lg',
  compact = false,
  subtle = false,
  mobileInline = false,
}: HeroActionsProps) {
  const t = useT() as TFunction;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const transition = { duration: prefersReducedMotion ? 0 : Math.max(0, animationDuration) };
  const variant = getVariantForKey('hero', 'base');

  const lngOverride = useMemo(() => {
    if (typeof window === 'undefined') return undefined as undefined | 'de' | 'en';
    const m = (window.location.pathname || '/').match(/^\/(de|en)(?=\/|$)/);
    return (m?.[1] as 'de' | 'en' | undefined) || undefined;
  }, []);

  const containerVariants = useMemo(
    () => getContainerVariants(prefersReducedMotion),
    [prefersReducedMotion],
  );

  const itemVariants = useMemo(
    () => getItemVariants(prefersReducedMotion, transition),
    [prefersReducedMotion, transition],
  );

  const primaryLabel = t('landing:hero.cta.primary', lngOverride ? { lng: lngOverride } : undefined);
  const secondaryLabel = t('landing:hero.cta.secondary', lngOverride ? { lng: lngOverride } : undefined);
  const secondaryAria = t('landing:hero.cta.secondaryAria', lngOverride ? { lng: lngOverride } : undefined);

  const groupAriaLabel =
    groupLabel || t('landing:hero.cta.groupLabel', lngOverride ? { lng: lngOverride } : undefined);

  return (
    <motion.div
      role="group"
      aria-label={groupAriaLabel}
      className={cn(
        mobileInline
          ? compact
            ? 'mt-4 flex flex-row gap-3 md:mt-5 px-4 sm:px-0'
            : 'mt-6 flex flex-row gap-3 sm:gap-4 md:mt-8 px-4 sm:px-0'
          : compact
            ? 'mt-4 flex flex-col sm:flex-row gap-3 md:mt-5 px-4 sm:px-0 justify-center'
            : 'mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 md:mt-8 px-4 sm:px-0 justify-center',
        className,
      )}
      initial="hidden"
      whileInView="show"
      viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
      variants={containerVariants}
      data-testid={testId}
    >
      <motion.div variants={itemVariants} data-testid={`${testId}-primary`}>
        <Button
          {...getButtonBaseProps(size, mobileInline)}
          onClick={
            onPrimaryClick ??
            (() =>
              track({ name: 'hero_cta_primary_click', props: { to: 'request_demo', variant } }))
          }
          aria-label={primaryLabel}
          className={cn(
            getButtonBaseProps(size, mobileInline).className,
            subtle
              ? 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/40'
              : 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/40',
            // Subtle sky-blue glow and focus override
            subtle
              ? 'hover:shadow-sm hover:shadow-sky-400/15'
              : 'hover:shadow-md hover:shadow-sky-400/25',
          )}
        >
          {primaryLabel}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} data-testid={`${testId}-secondary`}>
        <Button
          {...getButtonBaseProps(size, mobileInline)}
          variant="outline"
          onClick={
            onSecondaryClick ??
            (() =>
              track({
                name: 'hero_cta_secondary_click',
                props: { to: 'https://docs.sigmacode.ai', variant },
              }))
          }
          aria-label={secondaryAria}
          className={cn(
            getButtonBaseProps(size, mobileInline).className,
            subtle
              ? 'border-white/10 text-slate-200 hover:border-[rgb(var(--accent-ring))]/40 hover:bg-[rgb(var(--accent-ring))]/5'
              : 'btn-brand-outline',
            // Sky-blue focus styling
            'focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring))]',
          )}
        >
          {secondaryLabel}
        </Button>
      </motion.div>
    </motion.div>
  );
});

export default HeroActions;
