/**
 * DEPRECATED: This legacy comparison section is kept for reference.
 * The LandingPage uses `CompareAgentsSection` instead.
 */
import { FC } from 'react';
import { useT } from '~/utils/i18n';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import SectionHeading from '@/components/ui/SectionHeading';
import { Badge } from '~/components/ui/Badge';
import { tArray, tRecord, tString } from '@/locales/helpers';

// Simple utility function to concatenate class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const ComparisonSection: FC = () => {
  const t = useT();
  const columns: string[] = tArray(t, 'landing.comparison.columns', { returnObjects: true });

  const rowsObj: Record<string, string> = tRecord(t, 'landing.comparison.rows', {
    returnObjects: true,
  });
  const rowKeys = Object.keys(rowsObj);

  const taglines: Record<number, string> = {
    0: tString(t, 'landing.comparison.chatgpt_tagline'),
    1: tString(t, 'landing.comparison.sigmacode_tagline'),
    2: tString(t, 'landing.comparison.mas_tagline'),
  };

  // Availability matrix per row for [ChatGPT, Agents, MAS]
  const availability: Record<string, [boolean, boolean, boolean]> = {
    multi_models: [false, true, true],
    agents_workflows: [false, true, true],
    mas_orchestration: [false, false, true],
    integrations: [true, true, true],
    security_deployment: [false, true, true],
    governance_hitl: [false, true, true],
    extensibility: [false, true, true],
  };

  const renderBool = (value: boolean) =>
    value ? (
      <Check
        className="h-5 w-5 text-gray-300"
        aria-label={tString(t, 'landing.comparison.available')}
      />
    ) : (
      <X
        className="h-5 w-5 text-gray-500"
        aria-label={tString(t, 'landing.comparison.unavailable')}
      />
    );

  return (
    <LandingSection
      id="comparison"
      className="bg-transparent"
      bleed={false}
      ariaLabel={tString(t, 'landing.comparison.title')}
      aria-labelledby="comparison-heading"
      dataSection="comparison"
      data-ai-section="comparison"
      data-ai-title={tString(t, 'landing.comparison.title')}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: 0.5 }}
        className={`text-center`}
      >
        <HeadingBlock align="center">
          <span className="mb-4 inline-block">
            <Badge
              size="sm"
              tone="soft"
              variant="comparison"
              className="whitespace-nowrap py-1 sm:py-1"
              leadingIcon={<span aria-hidden className="text-[0.9em]">⚡</span>}
            >
              {t('landing.comparison.badge')}
            </Badge>
          </span>
          <SectionHeading
            id="comparison-heading"
            title={tString(t, 'landing.comparison.title')}
            subtitle={tString(t, 'landing.comparison.subtitle')}
            align="center"
          />
        </HeadingBlock>
      </motion.div>

      {/* Three-column comparison */}
      <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
        {columns.map((colTitle, colIdx) => (
          <div className="relative" key={`col-${colIdx}`}>
            <div
              className={cn(
                'overflow-hidden rounded-2xl border border-white/10 bg-transparent text-white',
              )}
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{colTitle}</h3>
                </div>
                <p className={cn('mb-6 text-sm', 'text-gray-400')}>{taglines[colIdx]}</p>
                <div className="space-y-4">
                  {rowKeys.map((rowKey) => (
                    <div key={`cell-${colIdx}-${rowKey}`} className="flex items-start">
                      <div className="mt-0.5 flex-shrink-0">
                        {renderBool((availability[rowKey] || [false, false, false])[colIdx])}
                      </div>
                      <p className="ml-3 text-sm">{rowsObj[rowKey]}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  {colIdx === 0 ? (
                    <a
                      href="https://chat.openai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
                    >
                      {tString(t, 'landing.comparison.visit_chatgpt')}
                    </a>
                  ) : (
                    <a
                      href="#contact"
                      className="flex w-full items-center justify-center rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
                    >
                      {tString(t, 'landing.comparison.cta')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  );
};

export default ComparisonSection;
