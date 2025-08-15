import { FC, memo, useMemo } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { SectionHeading } from '~/components/ui';
import { track } from '~/lib/analytics/track';
import { Check, X } from 'lucide-react';
import { links } from '~/config/links';
import { Badge } from '~/components/ui/Badge';

// Migration: Alle Übersetzungen erfolgen über useT() mit vollqualifizierten Keys unter "landing.*".

const features = [
  'multi_models',
  'agents_workflows',
  'mas_orchestration',
  'integrations',
  'security_deployment',
  'governance_hitl',
  'extensibility',
] as const;

// Fallback-Strings entfernt – Übersetzungen müssen in den Locale-Dateien vorhanden sein.

const CompareAgentsSection: FC = () => {
  // useT mit vollqualifizierten Keys unter "landing.*"
  const t = useT();
  const reduceMotion = useReducedMotion() ?? false;

  const title = t('landing.comparison.title');
  const subtitle = t('landing.comparison.subtitle');

  // Debug/Placeholder-Modus deaktiviert: echte Übersetzungen anzeigen
  const placeholders = false;

  const colA_Title = placeholders
    ? 'landing.comparison.colA.title'
    : t('landing.comparison.colA.title');
  const colA_Badge = placeholders
    ? 'landing.comparison.colA.badge'
    : t('landing.comparison.colA.badge');
  const colA_Cta = placeholders ? 'landing.comparison.colA.cta' : t('landing.comparison.colA.cta');

  // Entfernt: mittlere Karte (Agenten). Wir vergleichen direkt ChatGPT vs SIGMACODE AI (MAS)

  const colC_Title = placeholders
    ? 'landing.comparison.colC.title'
    : t('landing.comparison.colC.title');
  const colC_Badge = placeholders
    ? 'landing.comparison.colC.badge'
    : t('landing.comparison.colC.badge');
  const colC_Cta = placeholders ? 'landing.comparison.colC.cta' : t('landing.comparison.colC.cta');

  // Resolve Bulletpoints je Seite (direkter Vergleich)
  const resolvedChatGPT = useMemo(
    () =>
      features.map((k) =>
        placeholders
          ? `landing.comparison.points.${k}.chatgpt`
          : t(`landing.comparison.points.${k}.chatgpt`),
      ),
    [t, placeholders],
  );
  const resolvedMAS = useMemo(
    () =>
      features.map((k) =>
        placeholders
          ? `landing.comparison.points.${k}.mas`
          : t(`landing.comparison.points.${k}.mas`),
      ),
    [t, placeholders],
  );

  // Einfache Zuordnung: Welche Seite profitiert pro Feature?
  // true = Vorteil bei SIGMACODE MAS, false = Vorteil bei ChatGPT
  const masAdvantage: Record<(typeof features)[number], boolean> = {
    multi_models: true,
    agents_workflows: true,
    mas_orchestration: true,
    integrations: true,
    security_deployment: true,
    governance_hitl: true,
    extensibility: true,
  };
  // Debug-Ausgabe (einmal pro Render)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.debug('[CompareAgentsSection] bullets', { chatgpt: resolvedChatGPT, mas: resolvedMAS });
  }

  // Framer Motion Variants für Micro-Animationen
  const listVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.04 * i, delayChildren: 0.05 },
    }),
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0 },
  } as const;

  const onCtaClick = (variant: 'chatgpt' | 'mas') => {
    track({ name: 'comparison_cta_click', props: { variant, section: 'comparison', page: 'landing' } });
  };

  return (
    <LandingSection
      id="comparison"
      bleed={false}
      ariaLabel={title as string}
      className="relative bg-transparent"
      dataSection="comparison"
      data-ai-section="comparison"
      data-ai-title={String(title)}
      data-section="comparison"
      data-section-title={String(title)}
      accentTopGlow
    >
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 720px' }}
      >
        <HeadingBlock align="center">
          <div className="mb-3 md:mb-4">
            <Badge size="sm" tone="soft" variant="comparison" className="whitespace-nowrap py-1 sm:py-1" leadingIcon={<span aria-hidden className="text-[0.9em]">⚡</span>}>
              {t('landing.comparison.badge')}
            </Badge>
          </div>
          <div className="mx-auto max-w-3xl">
            <SectionHeading title={title} subtitle={subtitle} align="center" />
          </div>
        </HeadingBlock>

        <div className="mt-8 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          {/* Column A: ChatGPT */}
          <motion.div
            className="group relative rounded-2xl border border-white/10 bg-transparent p-5 transition-colors hover:bg-white/5 md:p-6 bg-gradient-to-b from-brand-purple/[0.05] to-transparent hover:border-brand-purple/20 hover:shadow-[0_10px_30px_rgba(var(--rgb-brand-purple)/0.15)]"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={
              reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 20 }
            }
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{colA_Title}</h3>
              <Badge size="sm" tone="soft" variant="comparison" className="whitespace-nowrap py-1 sm:py-1">{colA_Badge}</Badge>
            </div>
            <motion.ul
              className="space-y-3 text-gray-200"
              variants={listVariants}
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={IN_VIEW_ONCE}
              role="list"
            >
              {features.map((f, i) => (
                <motion.li
                  key={`a-${f}`}
                  className="flex items-start gap-3"
                  variants={itemVariants}
                  role="listitem"
                >
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-transparent"
                    aria-hidden={false}
                    aria-label={masAdvantage[f] ? String(t('landing.comparison.unavailable')) : String(t('landing.comparison.available'))}
                  >
                    {masAdvantage[f] ? (
                      <X className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-gray-300" aria-hidden />
                    )}
                  </span>
                  <span className="flex-1">{resolvedChatGPT[i]}</span>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-6">
              <a
                href={links.comparison.chatgpt}
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ring-1 ring-brand-purple/20 hover:ring-brand-purple/30 hover:shadow-[0_0_24px_rgba(var(--rgb-brand-purple)/0.25)]"
                data-ai-element="comparison_cta"
                data-ai-label={String(colA_Cta)}
                onClick={() => onCtaClick('chatgpt')}
              >
                {colA_Cta}
              </a>
            </div>
          </motion.div>

          {/* Column C: SIGMACODE AI (MAS) */}
          <motion.div
            className="group relative rounded-2xl border border-white/10 bg-transparent p-5 transition-colors hover:bg-white/5 md:p-6 bg-gradient-to-b from-brand-purple/[0.05] to-transparent hover:border-brand-purple/20 hover:shadow-[0_10px_30px_rgba(var(--rgb-brand-purple)/0.15)]"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={
              reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 20 }
            }
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{colC_Title}</h3>
              <Badge size="sm" tone="soft" variant="comparison" className="whitespace-nowrap py-1 sm:py-1">{colC_Badge}</Badge>
            </div>
            <motion.ul
              className="space-y-3 text-gray-200"
              variants={listVariants}
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={IN_VIEW_ONCE}
              custom={2}
              role="list"
            >
              {features.map((f, i) => (
                <motion.li
                  key={`c-${f}`}
                  className="flex items-start gap-3"
                  variants={itemVariants}
                  role="listitem"
                >
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-transparent"
                    aria-hidden={false}
                    aria-label={masAdvantage[f] ? String(t('landing.comparison.available')) : String(t('landing.comparison.unavailable'))}
                  >
                    {masAdvantage[f] ? (
                      <Check className="h-3.5 w-3.5 text-brand-purple" aria-hidden />
                    ) : (
                      <X className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                    )}
                  </span>
                  <span className="flex-1">{resolvedMAS[i]}</span>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-6">
              <a
                href={links.comparison.mas}
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ring-1 ring-brand-purple/20 hover:ring-brand-purple/30 hover:shadow-[0_0_24px_rgba(var(--rgb-brand-purple)/0.25)]"
                data-ai-element="comparison_cta"
                data-ai-label={String(colC_Cta)}
                onClick={() => onCtaClick('mas')}
              >
                {colC_Cta}
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </LandingSection>
  );
};

export default memo(CompareAgentsSection);
