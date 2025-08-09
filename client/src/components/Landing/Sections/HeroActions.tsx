import React, { memo, useMemo } from 'react';
import { motion, useReducedMotion, type Variants, type Transition } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
}

type TFunction = (key: string, options?: { defaultValue?: string; [key: string]: any }) => string;

const ANIMATION_DELAY = 0.3;
const STAGGER_DELAY = 0.08;

const getContainerVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    ...(prefersReducedMotion ? {} : {
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

const buttonBaseProps: Pick<ButtonProps, 'size' | 'className'> = {
  size: 'lg',
  className: 'w-full sm:w-auto',
};

export const HeroActions = memo(function HeroActions({
  onPrimaryClick,
  onSecondaryClick,
  className,
  animationDuration = 0.5,
  groupLabel,
  testId = 'hero-actions',
}: HeroActionsProps) {
  const { t } = useTranslation(['landing', 'translation']) as { t: TFunction };
  const prefersReducedMotion = useReducedMotion() ?? false;
  const transition = { duration: prefersReducedMotion ? 0 : Math.max(0, animationDuration) };

  const containerVariants = useMemo(
    () => getContainerVariants(prefersReducedMotion),
    [prefersReducedMotion]
  );

  const itemVariants = useMemo(
    () => getItemVariants(prefersReducedMotion, transition),
    [prefersReducedMotion, transition]
  );

  const primaryLabel = t('landing:hero.cta.primary', { defaultValue: 'Jetzt starten' });
  const secondaryLabel = t('landing:hero.cta.secondary', { defaultValue: 'Mehr erfahren' });

  return (
    <motion.div
      role="group"
      aria-label={groupLabel || 'Hauptaktionen'}
      className={cn('mt-6 md:mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4', className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      variants={containerVariants}
      data-testid={testId}
    >
      <motion.div variants={itemVariants} data-testid={`${testId}-primary`}>
        <Button
          {...buttonBaseProps}
          onClick={onPrimaryClick}
          aria-label={primaryLabel}
        >
          {primaryLabel}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} data-testid={`${testId}-secondary`}>
        <Button
          {...buttonBaseProps}
          variant="outline"
          onClick={onSecondaryClick}
          aria-label={secondaryLabel}
        >
          {secondaryLabel}
        </Button>
      </motion.div>
    </motion.div>
  );
});

export default HeroActions;
