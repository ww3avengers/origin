import { FC, memo, useCallback, useEffect, useMemo } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion, easeOut } from 'framer-motion';
import HeroActions from './HeroActions';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import SectionHeading from '../SectionHeading';
import { Star } from 'lucide-react';
import { getVariantForKey } from '@/lib/ab/variant';
import { track } from '@/lib/analytics/track';
import i18n from '~/locales/i18n';

// Verwende direkt t('landing.*')

const CTASection: FC = () => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;
  const abVariant = getVariantForKey('cta', 'base');
  const lngOverride = useMemo(() => {
    if (typeof window === 'undefined') return undefined as undefined | 'de' | 'en';
    const m = (window.location.pathname || '/').match(/^\/(de|en)(?=\/|$)/);
    return (m?.[1] as 'de' | 'en' | undefined) || undefined;
  }, []);

  const handlePrimary = useCallback(() => {
    // Track Primary CTA
    track({ name: 'cta_primary_click', props: { to: '/register', variant: abVariant } });
    window.location.assign('/register');
  }, [abVariant]);

  const handleSecondary = useCallback(() => {
    const to = 'https://github.com/sigmacode-ai/sigmacode';
    // Track Secondary CTA
    track({ name: 'cta_secondary_click', props: { to, variant: abVariant } });
    window.open(to, '_blank', 'noopener,noreferrer');
  }, [abVariant]);

  // Impression tracking once on mount/variant
  useEffect(() => {
    track({ name: 'cta_impression', props: { variant: abVariant } });
  }, [abVariant]);

  const sectionTitle = t('landing:cta.title', lngOverride ? { lng: lngOverride } : undefined);
  // Vereinheitlichter Key: camelCase (groupLabel)
  const actionsGroupLabel = t(
    'landing:cta.groupLabel',
    lngOverride ? { lng: lngOverride } : undefined,
  );

  return (
    // Dev diagnostics
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {process.env.NODE_ENV === 'development' && (
        <span style={{ display: 'none' }} data-testid="cta-i18n-debug">
          {(() => {
            try {
              const current = (i18n?.language || '').toString();
              const deTitle = t('landing:cta.title', { lng: 'de' });
              const enTitle = t('landing:cta.title', { lng: 'en' });
              // Surface a tiny debug line in DOM for quick inspection
              console.info('[CTA][i18n-debug]', { current, lngOverride, deTitle, enTitle });
            } catch {}
            return null as any;
          })()}
        </span>
      )}
    
    <LandingSection
      className="relative bg-transparent"
      divider="none"
      ariaLabel={sectionTitle}
      aria-labelledby="cta-heading"
      dataSection="cta"
      data-ai-section="cta"
      data-ai-title={sectionTitle}
      data-section="cta"
      data-analytics-section="cta"
      containerClassName="relative z-10"
    >
      {/* Card (clean, no background effects) */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.995 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
        transition={{ duration: baseDuration, ease: easeOut }}
        className="relative mx-auto mb-6 max-w-4xl overflow-visible rounded-2xl border border-white/10 bg-transparent p-7 text-center md:mb-8 lg:mb-10 md:p-10 pt-10 md:pt-14"
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 420px' }}
      >
        {/* removed shiny inner overlays */}

        {/* Badge wird über SectionHeading-Badge-Props gerendert */}

        {/* Heading + Description */}
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={IN_VIEW_ONCE}
          transition={{ duration: baseDuration }}
          className="mb-6"
          style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 200px' }}
        >
          <SectionHeading
            titleId="cta-heading"
            title={t('landing:cta.title', lngOverride ? { lng: lngOverride } : undefined)}
            subtitle={t('landing:cta.subtitle', lngOverride ? { lng: lngOverride } : undefined)}
            align="center"
            badge={t('landing:cta.badge', lngOverride ? { lng: lngOverride } : undefined)}
            badgeVariant="system"
            badgeTone="soft"
            badgeLeadingIcon={<Star className="h-3.5 w-3.5" aria-hidden />}
          />
          <p className="mx-auto max-w-2xl text-base text-gray-300/95">
            {t('landing:cta.description', lngOverride ? { lng: lngOverride } : undefined)}
          </p>
        </motion.div>

        {/* Action Buttons (centralized) */}
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={IN_VIEW_ONCE}
          transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.12 }}
          className="mt-6 flex justify-center"
          style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 64px' }}
        >
          <HeroActions
            onPrimaryClick={handlePrimary}
            onSecondaryClick={handleSecondary}
            groupLabel={actionsGroupLabel}
          />
        </motion.div>

        {/* subtle bottom note */}
        <p className="mt-6 text-xs text-gray-400/90">
          {t('landing:cta.note', lngOverride ? { lng: lngOverride } : undefined)}
        </p>
      </motion.div>
    </LandingSection>
    </>
  );
};

export default memo(CTASection);
