import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { GradientHeading } from '@/components/ui/GradientHeading';
import { HeroActions } from './HeroActions';

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

import { HeroFeatures } from './HeroFeatures';
import { HeroLogos } from './HeroLogos';

interface HeroContentProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1
    }
  }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Removed custom global style injection to simplify and avoid side-effects

export function HeroContent({
  onPrimaryClick,
  onSecondaryClick,
  className,
}: HeroContentProps) {
  const { t } = useTranslation(['landing', 'translation']) as { t: TFunction };
  
  // Get translations with fallbacks
  const translations = {
    badge: t('landing:hero.badge', { defaultValue: '🚀 NEU: Jetzt mit KI-Agenten' }),
    title: t('landing:hero.title', { defaultValue: 'SIGMACODE AI' }),
    subtitle: {
      line1: t('landing:hero.subtitle.line1', { defaultValue: 'Innovative KI-Lösungen für Ihr Unternehmen' }),
      line2: t('landing:hero.subtitle.line2', { defaultValue: '' }),
      highlight: t('landing:hero.subtitle.highlight', { defaultValue: 'einfach, sicher und leistungsstark' })
    },
    description: t('landing:hero.description', { defaultValue: 'Entdecken Sie die Zukunft der künstlichen Intelligenz mit unseren maßgeschneiderten Lösungen für Ihr Unternehmen.' }),
    cta: {
      primary: t('landing:hero.cta.primary', { defaultValue: 'Kostenlos testen' }),
      secondary: t('landing:hero.cta.secondary', { defaultValue: 'Mehr erfahren' }),
      secondaryAria: t('landing:hero.cta.secondaryAria', { defaultValue: 'Mehr über SIGMACODE AI erfahren' })
    },
    trustedBy: t('landing:hero.trustedBy', { defaultValue: 'Vertrauen Sie den Besten' })
  };

  return (
    <>
      {/* Badge: reduziert, AA-kontrast, ohne Dauer-Ping */}
      <motion.div
        className="relative mb-6 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
        <span className="tracking-wide">{translations.badge}</span>
      </motion.div>


      {/* Main Content */}
      <motion.div
        className={cn('w-full space-y-7', className)}
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
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        

        {/* Title */}
        <motion.div variants={fadeInUp}>
          <GradientHeading 
            as="h1" 
            size="4xl"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {translations.title}
          </GradientHeading>
        </motion.div>

        {/* Subtitle & CTAs */}
        <motion.div 
          className="mx-auto flex max-w-3xl flex-col gap-3"
          variants={fadeInUp}
        >
          {/* Erste Zeile: solid, bessere Lesbarkeit */}
          <p className="text-xl text-gray-200 md:text-2xl">{translations.subtitle.line1}</p>

          {/* Vereinheitlichte CTA-Gruppe */}
          <HeroActions
            onPrimaryClick={onPrimaryClick}
            onSecondaryClick={onSecondaryClick}
            className="justify-center"
          />

          {/* Micro-Trust direkt unter CTAs */}
          <motion.p
            className="-mt-1 text-center text-xs text-gray-400"
            variants={fadeIn}
            aria-live="polite"
          >
            {t('landing:hero.microtrust', { ns: 'landing', defaultValue: 'Keine Kreditkarte erforderlich · In 2 Minuten startklar' })}
          </motion.p>

          {/* Highlight-Zeile mit begrenztem Gradient */}
          <p className="mt-1 text-lg md:mt-1.5 md:text-xl">
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text font-semibold text-transparent">
              {translations.subtitle.highlight}
            </span>
          </p>
        </motion.div>

        {/* Description */}
        <motion.p 
          className="mx-auto max-w-2xl text-lg text-gray-300"
          variants={fadeInUp}
        >
          {translations.description}
        </motion.p>


      </motion.div>

      {/* Features */}
      <motion.div
        className="mt-24 w-full"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <HeroFeatures />
      </motion.div>

      {/* Logos */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full mt-16"
      >
        <motion.p 
          className="text-sm mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-transparent">
            {translations.trustedBy}
          </span>
        </motion.p>
        <HeroLogos />
      </motion.div>
    </>
  );
}

export default HeroContent;
