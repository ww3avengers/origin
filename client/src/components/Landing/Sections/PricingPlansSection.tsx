import { FC, memo, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { SectionHeading, Button } from '~/components/ui';
import { getFAQItems } from './FAQSection';
import type { TFunc } from '@/locales/helpers';
import SegmentedToggle from '@/components/ui/primitives/SegmentedToggle';
import GlassCard from '@/components/ui/primitives/GlassCard';
import { track } from '@/lib/analytics/track';
import { getVariantForKey } from '@/lib/ab/variant';
import { Badge } from '~/components/ui/Badge';
import { Tags } from 'lucide-react';

// Split: Nur Karten + Billing Toggle (inkl. Enterprise-Karte mit Demo-Dialog)
const RequestDemoDialog = lazy(() => import('@/components/Landing/Dialogs/RequestDemoDialog'));

type BillingType = 'monthly' | 'yearly';

type PlanType = 'community' | 'professional' | 'team' | 'enterprise';

const PricingPlansSection: FC = () => {
  const t = useT();
  const [billingType, setBillingType] = useState<BillingType>('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<PlanType | null>(null);
  const [openDemo, setOpenDemo] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;
  const cardRefs = useRef<Record<PlanType, HTMLDivElement | null>>({
    community: null,
    professional: null,
    team: null,
    enterprise: null,
  });
  const impressionFired = useRef<Record<PlanType, boolean>>({
    community: false,
    professional: false,
    team: false,
    enterprise: false,
  });

  // Persist billing preference + A/B default
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('pricing.billing') as BillingType | null;
    if (stored === 'monthly' || stored === 'yearly') {
      setBillingType(stored);
      return;
    }
    const variant = getVariantForKey('pricingDefaultBilling');
    if (variant === 'alt') {
      setBillingType('yearly');
    }
  }, []);

  const handleBillingChange = (k: BillingType) => {
    setBillingType(k);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pricing.billing', k);
    }
    track({ name: 'pricing_billing_toggle', props: { to: k } });
  };

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
      isFree: true,
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
      isFree: false,
    },
    team: {
      title: t('landing.pricing.plans.team.title'),
      price: {
        monthly: t('landing.pricing.plans.team.price.monthly'),
        yearly: t('landing.pricing.plans.team.price.yearly'),
      },
      description: t('landing.pricing.plans.team.description'),
      features: [
        t('landing.pricing.plans.team.features.1'),
        t('landing.pricing.plans.team.features.2'),
        t('landing.pricing.plans.team.features.3'),
        t('landing.pricing.plans.team.features.4'),
        t('landing.pricing.plans.team.features.5'),
        t('landing.pricing.plans.team.features.6'),
      ],
      cta: t('landing.pricing.plans.team.cta'),
      ctaLink: '/register?plan=team',
      popular: false,
      discount: '18%',
      isFree: false,
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
      isFree: false,
    },
  };

  const planKeys: PlanType[] = ['community', 'professional', 'team', 'enterprise'];

  const cardVariants = {
    default: { scale: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.3 } },
    hover: prefersReduced
      ? { scale: 1, y: 0, transition: { duration: 0 } }
      : { scale: 1.03, y: -10, transition: { duration: 0.3 } },
  };

  // Mini-FAQ: greift auf bestehende FAQ-Inhalte zu (keine Duplikate)
  const miniFaq = useMemo(() => {
    const items = getFAQItems(t as unknown as TFunc);
    return items.slice(0, 4);
  }, [t]);

  // Card impression tracking (per Plan)
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLDivElement;
          const plan = el.getAttribute('data-plan') as PlanType | null;
          if (!plan || impressionFired.current[plan]) return;
          impressionFired.current[plan] = true;
          track({ name: 'pricing_card_impression', props: { plan, billingType } });
        });
      },
      { threshold: 0.4 }
    );
    (Object.keys(cardRefs.current) as PlanType[]).forEach((k) => {
      const node = cardRefs.current[k];
      if (node) io.observe(node);
    });
    return () => io.disconnect();
  }, [billingType]);

  // JSON-LD for offers and mini FAQ (best-effort parsing)
  const parsePrice = (value: string): { price: number | null; currency: string | null } => {
    const v = value.trim().toLowerCase();
    if (!v || /free|kostenlos|gratis/.test(v)) return { price: 0, currency: 'EUR' };
    const num = Number(v.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.'));
    const currency = /\$/.test(value) ? 'USD' : /€|eur/.test(value.toUpperCase()) ? 'EUR' : null;
    return { price: Number.isFinite(num) ? Number(num.toFixed(2)) : null, currency };
  };

  const jsonLd = useMemo(() => {
    const offers = (['community', 'professional', 'enterprise'] as PlanType[]).map((key) => {
      const plan = (plans as any)[key];
      const display = billingType === 'monthly' ? plan.price.monthly : plan.price.yearly;
      const { price, currency } = parsePrice(String(display));
      return {
        '@type': 'Offer',
        name: String(plan.title),
        priceCurrency: currency ?? 'EUR',
        price: price ?? undefined,
        category: key,
        url: key === 'enterprise' ? '/contact?plan=enterprise' : String(plan.ctaLink ?? '/'),
        availability: 'https://schema.org/InStock',
        eligibleRegion: 'https://schema.org/Worldwide',
        priceValidUntil: undefined,
      };
    });
    const faqs = miniFaq.map((f) => ({
      '@type': 'Question',
      name: String(f.question),
      acceptedAnswer: { '@type': 'Answer', text: '' },
    }));
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: offers,
      mainEntityOfPage: {
        '@type': 'FAQPage',
        mainEntity: faqs,
      },
    } as const;
  }, [plans, miniFaq, billingType]);

  return (
    <LandingSection
      className="bg-transparent"
      bleed={false}
      divider="none"
      ariaLabel={t('landing.pricing.title')}
      aria-labelledby="pricing-plans-heading"
      dataSection="pricing-plans"
      data-ai-section="pricing-plans"
      data-ai-title={t('landing.pricing.title')}
    >
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration }}
        className={`text-center`}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 420px' }}
      >
        <HeadingBlock align="center">
          <div className="mx-auto max-w-4xl">
            <SectionHeading
              id="pricing-plans-heading"
              title={t('landing.pricing.title')}
              subtitle={t('landing.pricing.subtitle')}
              align="center"
            />
            <p className="mt-5 text-base text-gray-200 md:text-lg">
              {t('landing.pricing.description')}
            </p>
          </div>
        </HeadingBlock>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.2 }}
        className="mb-10 flex justify-center"
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 64px' }}
      >
        <SegmentedToggle
          ariaLabel={t('landing.pricing.billing.aria_label') as string}
          size="md"
          options={[
            { key: 'monthly', label: t('landing.pricing.billing.monthly') },
            {
              key: 'yearly',
              label: (
                <span className="inline-flex items-center gap-2">
                  {t('landing.pricing.billing.yearly')}
                  <Badge
                    size="sm"
                    tone="soft"
                    variant="plans"
                    className="whitespace-nowrap py-1 sm:py-1"
                    leadingIcon={<Tags className="h-3.5 w-3.5" aria-hidden />}
                  >
                    {plans.professional.discount}
                  </Badge>
                </span>
              ),
            },
          ]}
          selectedKey={billingType}
          onChange={(k) => handleBillingChange(k as BillingType)}
        />
      </motion.div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
              className="relative"
              data-plan={planKey}
              ref={(el) => (cardRefs.current[planKey] = el)}
            >
              <GlassCard
                highlight={isProfessional}
                contentClassName="shadow-lg shadow-black/20 p-7 md:p-8 flex flex-col h-full"
              >
                {isProfessional && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge
                      size="sm"
                      tone="soft"
                      variant="plans"
                      className="whitespace-nowrap py-1 sm:py-1"
                      leadingIcon={<Tags className="h-3.5 w-3.5" aria-hidden />}
                    >
                      {t('landing.pricing.most_popular')}
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold text-white">{plan.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400">{plan.description}</p>
                </div>
                <div className="mb-6" aria-live="polite">
                  <div className="flex min-h-[48px] items-end gap-2">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={billingType}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: prefersReduced ? 0 : 0.2 }}
                        className="text-4xl font-bold text-white"
                      >
                        {billingType === 'monthly' ? plan.price.monthly : plan.price.yearly}
                      </motion.span>
                    </AnimatePresence>
                    {!plan.isFree && (
                      <span className="mb-1 text-gray-400">{t('landing.pricing.per_month')}</span>
                    )}
                  </div>
                  {billingType === 'yearly' && !plan.isFree && (
                    <div className="mt-2 text-sm text-gray-300">
                      <span>
                        {t('landing.pricing.save')} {plan.discount}{' '}
                        {t('landing.pricing.with_yearly')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-8 grow space-y-3.5">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
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
                  <Button
                    size="lg"
                    className="w-full h-11"
                    aria-label={`CTA ${plan.title}`}
                    onClick={() => setOpenDemo(true)}
                    onMouseDown={() =>
                      track({
                        name: 'pricing_cta_click',
                        props: { plan: planKey, billingType, target: 'dialog' },
                      })
                    }
                  >
                    {t('landing.pricing.plans.enterprise.cta')}
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="w-full h-11"
                    aria-label={`CTA ${plan.title}`}
                    onMouseDown={() =>
                      track({
                        name: 'pricing_cta_click',
                        props: {
                          plan: planKey,
                          billingType,
                          target: String(plan.ctaLink),
                        },
                      })
                    }
                  >
                    <a
                      href={plan.ctaLink}
                      {...(String(plan.ctaLink).startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {t(`landing.pricing.plans.${planKey}.cta`)}
                    </a>
                  </Button>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
      <Suspense fallback={null}>
        <RequestDemoDialog open={openDemo} onOpenChange={setOpenDemo} source="pricing-plans" />
      </Suspense>

      {/* Mini-FAQ unter Pricing: kompakt und verlinkt auf volle FAQ */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.1 }}
        className="mx-auto mt-10 max-w-5xl md:mt-12"
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 360px' }}
        aria-labelledby="mini-faq-heading"
      >
        <div className="mb-4 text-center">
          <h3 id="mini-faq-heading" className="text-sm uppercase tracking-wider text-gray-400">
            {t('landing.faq.title')}
          </h3>
          <span
            aria-hidden
            className="mx-auto mt-3 block h-px w-40 bg-gradient-to-r from-transparent via-[rgb(var(--accent-ring))]/40 to-transparent dark:via-[rgb(var(--accent-ring))]/20"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          {miniFaq.map((f) => (
            <a
              key={f.id}
              href={`#faq-${f.id}`}
              className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 transition-colors hover:border-[rgb(var(--accent-ring))]/40 hover:bg-[rgb(var(--accent-ring))]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-ring))]"
              aria-label={`Go to FAQ: ${f.question}`}
            >
              <span className="line-clamp-1 text-sm text-gray-200 group-hover:text-white">
                {f.question}
              </span>
              <svg
                className="ml-3 h-4 w-4 flex-shrink-0 text-[rgb(var(--accent))] group-hover:text-[rgb(var(--accent))]/90"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          ))}
        </div>
        <div className="mt-4 text-center">
          <a
            href="#faq"
            className="text-sm text-[rgb(var(--accent))] underline underline-offset-4 hover:text-[rgb(var(--accent))]/90"
          >
            {t('landing.faq.more_questions')}
          </a>
        </div>
      </motion.div>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(jsonLd)}
      </script>
    </LandingSection>
  );
};
export default memo(PricingPlansSection);
