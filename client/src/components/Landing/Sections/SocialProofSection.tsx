import { FC } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { SectionHeading } from '~/components/ui';

const SocialProofSection: FC = () => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;

  const testimonials = [
    {
      quote: t('landing.testimonials.1.quote'),
      author: t('landing.testimonials.1.author'),
      role: t('landing.testimonials.1.role'),
      avatar: '/assets/testimonials/user1.jpg',
    },
    // Weitere Testimonials...
  ];

  // Logos werden über die zentrale Komponente HeroLogos gerendert

  const stats = [
    {
      value: t('landing.stats.values.users'),
      label: t('landing.stats.users'),
    },
    {
      value: t('landing.stats.values.satisfaction'),
      label: t('landing.stats.satisfaction'),
    },
    {
      value: t('landing.stats.values.support'),
      label: t('landing.stats.support'),
    },
    {
      value: t('landing.stats.values.integrations'),
      label: t('landing.stats.integrations'),
    },
  ];

  const sectionTitle = t('landing.testimonials.title');
  const sectionSubtitle = t('landing.testimonials.subtitle');

  return (
    <LandingSection
      id="social-proof"
      className="bg-transparent"
      bleed={false}
      ariaLabel={sectionTitle}
      aria-labelledby="socialproof-heading"
      dataSection="social-proof"
      data-ai-section="social-proof"
      data-ai-title={sectionTitle}
    >
      <HeadingBlock align="center">
        <SectionHeading
          id="socialproof-heading"
          title={sectionTitle}
          subtitle={sectionSubtitle}
          align="center"
        />
      </HeadingBlock>
      {/* Logos entfernt – nur im Hero anzeigen */}
      <div className="mb-2" />

      {/* Testimonials */}
      <div className="mb-20 grid gap-8 md:grid-cols-2">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ ...IN_VIEW_ONCE, margin: '-50px' }}
            transition={{ duration: baseDuration, delay: prefersReduced ? 0 : index * 0.2 }}
            className="rounded-2xl border border-white/10 bg-transparent p-8 ring-1 ring-inset ring-white/10"
          >
            <div className="mb-4 flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl text-white ring-1 ring-inset ring-white/15">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="h-full w-full rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    width={48}
                    height={48}
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="ml-4">
                <p className="font-medium text-white">{testimonial.author}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </div>
            <p className="italic text-gray-300">"{testimonial.quote}"</p>
          </motion.div>
        ))}
      </div>

      {/* Statistik-Banner */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration }}
        className="rounded-2xl border border-white/10 bg-transparent p-8 text-center ring-1 ring-inset ring-white/10"
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 280px' }}
      >
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="mb-2 text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </LandingSection>
  );
};

export default SocialProofSection;
