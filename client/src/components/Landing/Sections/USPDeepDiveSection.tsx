import { FC } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { SectionHeading } from '~/components/ui';
import { Check } from 'lucide-react';

const USPDeepDiveSection: FC = () => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;

  const cards =
    (t('landing.uspDeepDive.cards', { returnObjects: true }) as unknown as Array<{
      title: string;
      bullets: string[];
    }>) || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: prefersReduced ? 0 : 0.12 },
    },
  } as const;

  const item = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.45 } },
  } as const;

  return (
    <LandingSection
      id="usp-deep-dive"
      className="relative overflow-hidden bg-transparent"
      bleed={false}
      ariaLabel={t('landing.uspDeepDive.title') as string}
      aria-labelledby="usp-deep-dive-heading"
      dataSection="usp-deep-dive"
      data-ai-section="usp-deep-dive"
      data-ai-title={t('landing.uspDeepDive.title') as string}
    >
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: prefersReduced ? 0 : 0.5 }}
        className=""
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 360px' }}
      >
        <HeadingBlock align="center">
          <SectionHeading
            id="usp-deep-dive-heading"
            title={t('landing.uspDeepDive.title') as string}
            subtitle={t('landing.uspDeepDive.subtitle') as string}
            align="center"
          />
        </HeadingBlock>
      </motion.div>

      <motion.div
        className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ ...IN_VIEW_ONCE, margin: '-100px' }}
      >
        {cards.map((card, idx) => (
          <motion.article
            key={`usp-card-${idx}`}
            variants={item}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-transparent p-6 shadow-sm ring-1 ring-inset ring-white/10 transition-all focus-within:outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/40"
            tabIndex={0}
            aria-labelledby={`usp-card-${idx}-title`}
            role="region"
          >
            {/* gradient overlay removed for neutrality */}
            <h3
              id={`usp-card-${idx}-title`}
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {card.title}
            </h3>
            <ul className="mt-4 space-y-2">
              {card.bullets.map((bullet, i) => (
                <li
                  key={`usp-card-${idx}-bullet-${i}`}
                  className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                >
                  <Check className="mr-2 mt-0.5 h-4 w-4 text-white" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </motion.div>
    </LandingSection>
  );
};

export default USPDeepDiveSection;
