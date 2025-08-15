import { FC, memo, Suspense, lazy, useState } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { Button } from '~/components/ui';
import SectionHeading from '../SectionHeading';
import { Tags } from 'lucide-react';
import { getIcon } from '@/components/ui/icons';
import { track } from '@/lib/analytics/track';
const RequestDemoDialog = lazy(() => import('@/components/Landing/Dialogs/RequestDemoDialog'));

// Split: Enterprise CTA Block (separat von den Karten)

const PricingEnterpriseSection: FC = () => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;
  const [openDemo, setOpenDemo] = useState(false);

  return (
    <LandingSection
      className="bg-transparent"
      bleed={false}
      aria-labelledby="pricing-enterprise-heading"
      dataSection="pricing-enterprise"
      data-ai-section="pricing-enterprise"
      data-ai-title={t('landing.pricing.enterprise_title') as string}
    >
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration }}
        className={`mx-auto max-w-5xl`}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 340px' }}
      >
        <HeadingBlock align="center">
          <div className="relative rounded-2xl bg-white/5 backdrop-blur-xl shadow-lg shadow-black/10 ring-1 ring-inset ring-white/10 dark:bg-zinc-900/30">
            <div className="rounded-2xl px-4 py-6 text-center md:text-left md:flex md:items-start md:justify-between md:gap-8 md:px-8 md:py-10">
              <div className="md:w-1/2">
                <SectionHeading
                  titleId="pricing-enterprise-heading"
                  title={t('landing.pricing.enterprise_title')}
                  subtitle={t('landing.pricing.enterprise_description')}
                  align="center"
                  badge={t('landing.pricing.title')}
                  badgeVariant="pricing"
                  badgeTone="soft"
                  badgeLeadingIcon={<Tags className="h-3.5 w-3.5" aria-hidden />}
                />
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
                  <Button
                    type="button"
                    size="lg"
                    aria-label={String(t('landing.pricing.contact_sales'))}
                    data-ai-action="pricing-enterprise-contact"
                    onClick={() => {
                      track({ name: 'pricing_enterprise_cta_click', props: { action: 'contact_sales' } });
                      setOpenDemo(true);
                    }}
                    className="w-full sm:w-auto h-11"
                  >
                    {t('landing.pricing.contact_sales') as string}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    aria-label={String(t('landing.pricing.enterprise_docs'))}
                    data-ai-action="pricing-enterprise-docs"
                    className="w-full sm:w-auto h-11"
                    onClick={() => {
                      track({ name: 'pricing_enterprise_docs_click', props: { action: 'docs' } });
                    }}
                  >
                    <a href="/docs/enterprise">{t('landing.pricing.enterprise_docs') as string}</a>
                  </Button>
                </div>
              </div>
              {/* Trust bullets */}
              <ul
                className="mt-6 grid gap-2 text-left sm:mt-8 sm:grid-cols-2 md:w-1/2"
                aria-label={String(t('landing.sections.pricingEnterprise') ?? 'Enterprise bullets')}
                data-ai-list="pricing-enterprise-bullets"
              >
                {([
                  'sla',
                  'sso',
                  'onprem',
                  'dpa',
                  'audit',
                  'support',
                ] as const).map((key) => {
                  const Icon = getIcon(key as any);
                  return (
                    <li key={key} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <Icon className="h-4 w-4 text-[rgb(var(--accent))]" aria-hidden />
                      <span>{t(`landing.pricing.enterprise_bullets.${key}`) as string}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </HeadingBlock>
      </motion.div>
      <Suspense fallback={null}>
        <RequestDemoDialog open={openDemo} onOpenChange={setOpenDemo} source="pricing-enterprise" />
      </Suspense>
    </LandingSection>
  );
};

export default memo(PricingEnterpriseSection);
