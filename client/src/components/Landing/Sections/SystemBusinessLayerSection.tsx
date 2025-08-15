import { FC, memo } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { SectionHeading, getIcon } from '~/components/ui';
import { getVariantForKey } from '@/lib/ab/variant';
import { track } from '@/lib/analytics/track';
import { Badge } from '~/components/ui/Badge';
import { Star } from 'lucide-react';

const SystemBusinessLayerSection: FC = memo(() => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;
  const tr = (k: string) => (t(k as any) as unknown as string) ?? '';
  const Icon = getIcon('business' as any);
  const abVariant = getVariantForKey('cta', 'base');

  const badges = t('system.layers.business.badges', { returnObjects: true } as any) as unknown as
    | string[]
    | undefined;
  const hasBadges = Array.isArray(badges) && badges.length > 0;

  return (
    <LandingSection
      id="system-business"
      ariaLabel={tr('system.layers.business.title') || 'Business‑KI Ebene'}
      className="bg-transparent"
      bleed={false}
      dataSection="system-business"
      data-ai-section="system-business"
      data-ai-title={tr('system.layers.business.short') || 'Business‑KI'}
    >
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: prefersReduced ? 0 : 0.45 }}
        className={`text-center`}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 420px' }}
      >
        <HeadingBlock align="center">
          <SectionHeading
            title={tr('system.layers.business.title')}
            subtitle={tr('system.layers.business.desc')}
            align="center"
          />
        </HeadingBlock>
      </motion.div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-transparent p-6 ring-1 ring-inset ring-white/10">
        <div className="mb-4 inline-flex items-center gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-inset ring-white/15`}
          >
            <Icon size={16} aria-hidden="true" />
          </div>
          <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {tr('system.layers.business.short')}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {tr('system.layers.business.title')}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {tr('system.layers.business.desc')}
        </p>
        {hasBadges && (
          <ul
            className="mt-3 flex flex-wrap gap-1.5"
            aria-label={
              (t as any)('system.badges_aria', { defaultValue: 'Schlüsselfähigkeiten' }) as string
            }
          >
            {badges!.map((b, i) => (
              <li key={i}>
                <Badge
                  size="sm"
                  variant="system"
                  tone="soft"
                  className="whitespace-nowrap py-1 sm:py-1"
                  leadingIcon={<Star className="h-3.5 w-3.5" aria-hidden />}
                >
                  {b}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <a
            href="#contact"
            className="text-sm font-medium text-gray-200 underline underline-offset-2 hover:text-white"
            data-analytics={`system_business_link`}
            aria-label={tr('system.layers.business.link') || 'Vertrieb kontaktieren'}
            onClick={() =>
              track({
                name: `click_system_business_link`,
                props: { variant: abVariant, section: 'system_business' },
              })
            }
          >
            {tr('system.layers.business.link') || 'Vertrieb kontaktieren'}
          </a>
        </div>
      </div>
    </LandingSection>
  );
});

export default SystemBusinessLayerSection;
