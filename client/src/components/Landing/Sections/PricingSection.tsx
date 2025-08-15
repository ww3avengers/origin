/**
 * DEPRECATED: Legacy wrapper section.
 * LandingPage rendert `PricingPlansSection` und `PricingEnterpriseSection` direkt.
 * Datei bleibt aus Kompatibilitätsgründen bestehen.
 */
import { FC, useState } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import HeroActions from './HeroActions';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import { SectionHeading } from '~/components/ui';
import RequestDemoDialog from '@/components/Landing/Dialogs/RequestDemoDialog';
import PricingPlansSection from './PricingPlansSection';
import PricingEnterpriseSection from './PricingEnterpriseSection';
import { Badge } from '~/components/ui/Badge';

type BillingType = 'monthly' | 'yearly';
type PlanType = 'community' | 'professional' | 'enterprise';

const PricingSection: FC = () => {
  // Wrapper-Modus: rendert die beiden neuen Pricing-Subsections
  return (
    <>
      <PricingPlansSection />
      <PricingEnterpriseSection />
    </>
  );
  // Ab hier: alter Code bleibt erhalten, wird jedoch nicht mehr ausgeführt (Abwärtskompatibilität der Datei)
  const t = useT();
  const [billingType, setBillingType] = useState<BillingType>('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<PlanType | null>(null);
  const [openDemo, setOpenDemo] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;

  const plans = {
    community: {
      title: t('landing.pricing.plans.community.title'),
      price: {
        monthly: t('landing.pricing.plans.community.price.monthly'),
        yearly: t('landing.pricing.plans.community.price.yearly'),
      },
      description: t('landing.pricing.plans.community.description'),
      features: [
        t('landing.pricing.plans.community.features.1'),
        t('landing.pricing.plans.community.features.2'),
        t('landing.pricing.plans.community.features.3'),
        t('landing.pricing.plans.community.features.4'),
        t('landing.pricing.plans.community.features.5'),
      ],
      cta: t('landing.pricing.plans.community.cta'),
      ctaLink: 'https://github.com/sigmacode-ai/sigmacode',
      popular: false,
      discount: '0%',
    },
    professional: {
      title: t('landing.pricing.plans.professional.title'),
      price: {
        monthly: t('landing.pricing.plans.professional.price.monthly'),
        yearly: t('landing.pricing.plans.professional.price.yearly'),
      },
      description: t('landing.pricing.plans.professional.description'),
      features: [
        t('landing.pricing.plans.professional.features.1'),
        t('landing.pricing.plans.professional.features.2'),
        t('landing.pricing.plans.professional.features.3'),
        t('landing.pricing.plans.professional.features.4'),
        t('landing.pricing.plans.professional.features.5'),
        t('landing.pricing.plans.professional.features.6'),
      ],
      cta: t('landing.pricing.plans.professional.cta'),
      ctaLink: '/register?plan=professional',
      popular: true,
      discount: '15%',
    },
    enterprise: {
      title: t('landing.pricing.plans.enterprise.title'),
      price: {
        monthly: t('landing.pricing.plans.enterprise.price.monthly'),
        yearly: t('landing.pricing.plans.enterprise.price.yearly'),
      },
      description: t('landing.pricing.plans.enterprise.description'),
      features: [
        t('landing.pricing.plans.enterprise.features.1'),
        t('landing.pricing.plans.enterprise.features.2'),
        t('landing.pricing.plans.enterprise.features.3'),
        t('landing.pricing.plans.enterprise.features.4'),
        t('landing.pricing.plans.enterprise.features.5'),
        t('landing.pricing.plans.enterprise.features.6'),
        t('landing.pricing.plans.enterprise.features.7'),
        t('landing.pricing.plans.enterprise.features.8'),
      ],
      cta: t('landing.pricing.plans.enterprise.cta'),
      ctaLink: '/contact?plan=enterprise',
      popular: false,
      discount: '20%',
    },
  };

  const planKeys: PlanType[] = ['community', 'professional', 'enterprise'];

  // Animation variants
  const cardVariants = {
    default: { scale: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.3 } },
    hover: prefersReduced
      ? { scale: 1, y: 0, transition: { duration: 0 } }
      : { scale: 1.03, y: -10, transition: { duration: 0.3 } },
  };

  const handlePrimaryEnterprise = () => {
    setOpenDemo(true);
  };

  const handleSecondaryEnterprise = () => {
    window.open('https://docs.sigmacode.ai/deployment/enterprise', '_blank', 'noopener,noreferrer');
  };

  return (
    <LandingSection
      className="bg-transparent"
      bleed={false}
      ariaLabel={t('landing.pricing.title')}
      aria-labelledby="pricing-heading"
      dataSection="pricing"
      data-ai-section="pricing"
      data-ai-title={t('landing.pricing.title')}
    >
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration }}
        className="mb-16 text-center"
      >
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            id="pricing-heading"
            title={t('landing.pricing.title')}
            subtitle={t('landing.pricing.subtitle')}
            align="center"
          />
          <p className="mt-6 text-xl text-gray-300">{t('landing.pricing.description')}</p>
        </div>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.2 }}
        className="mb-12 flex justify-center"
      >
        <div className="inline-flex rounded-full bg-transparent p-1 ring-1 ring-inset ring-white/10">
          <button
            onClick={() => setBillingType('monthly')}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 ${
              billingType === 'monthly'
                ? 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {t('landing.pricing.billing.monthly')}
          </button>
          <button
            onClick={() => setBillingType('yearly')}
            className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 ${
              billingType === 'yearly'
                ? 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {t('landing.pricing.billing.yearly')}
            <Badge size="sm" tone="soft" variant="pricing" className="whitespace-nowrap py-1 sm:py-1">-20%</Badge>
          </button>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        {planKeys.map((planKey, index) => {
          const plan = plans[planKey];
          const isHovered = hoveredPlan === planKey;
          const isProfessional = planKey === 'professional';

          return (
            <motion.div
              key={planKey}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={IN_VIEW_ONCE}
              transition={{ duration: baseDuration, delay: prefersReduced ? 0 : index * 0.1 + 0.3 }}
              variants={cardVariants}
              animate={isHovered ? 'hover' : 'default'}
              onMouseEnter={() => !prefersReduced && setHoveredPlan(planKey)}
              onMouseLeave={() => !prefersReduced && setHoveredPlan(null)}
              className={`relative rounded-2xl border bg-transparent p-8 ring-1 ring-inset ${
                isProfessional ? 'border-white/12 ring-white/10' : 'border-white/10 ring-white/10'
              } flex h-full transform flex-col shadow-md shadow-black/10 transition-all duration-300`}
            >
              {isProfessional && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge size="sm" tone="soft" variant="pricing" className="whitespace-nowrap py-1 sm:py-1">{t('landing.pricing.most_popular')}</Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-white">{plan.title}</h3>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">
                    {billingType === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  {plan.price.monthly !== 'Kostenlos' && (
                    <span className="mb-1 text-gray-400">{t('landing.pricing.per_month')}</span>
                  )}
                </div>
                {billingType === 'yearly' && plan.price.monthly !== 'Kostenlos' && (
                  <div className="mt-2 text-sm text-green-400">
                    <span>
                      {t('landing.pricing.save')} {plan.discount} {t('landing.pricing.with_yearly')}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-8 grow space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-sm text-gray-300">{feature as string}</span>
                  </div>
                ))}
              </div>

              {planKey === 'enterprise' ? (
                <button
                  onClick={() => setOpenDemo(true)}
                  className={`w-full rounded-lg px-6 py-3 text-center font-medium transition-colors duration-200 ${
                    isProfessional
                      ? 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15'
                      : 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15'
                  }`}
                  aria-label={`CTA ${plan.title}`}
                >
                  {t('landing.pricing.plans.enterprise.cta')}
                </button>
              ) : (
                <a
                  href={plan.ctaLink}
                  className={`w-full rounded-lg px-6 py-3 text-center font-medium transition-colors duration-200 ${
                    isProfessional
                      ? 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15'
                      : 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15'
                  }`}
                  aria-label={`CTA ${plan.title}`}
                >
                  {plan.cta}
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Enterprise Custom Quote */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.6 }}
        className="mx-auto mt-16 max-w-4xl rounded-2xl border border-white/10 bg-transparent p-8 text-center shadow-md shadow-black/10 ring-1 ring-inset ring-white/10"
      >
        <h3 className="mb-4 text-2xl font-bold text-white">
          {t('landing.pricing.enterprise_title')}
        </h3>
        <p className="mx-auto mb-6 max-w-2xl text-gray-300">
          {t('landing.pricing.enterprise_description')}
        </p>
        <div className="flex justify-center">
          <HeroActions
            onPrimaryClick={handlePrimaryEnterprise}
            onSecondaryClick={handleSecondaryEnterprise}
            groupLabel={t('landing.cta.groupLabel')}
          />
        </div>
      </motion.div>
      <RequestDemoDialog open={openDemo} onOpenChange={setOpenDemo} source="pricing" />
    </LandingSection>
  );
};

export default PricingSection;
