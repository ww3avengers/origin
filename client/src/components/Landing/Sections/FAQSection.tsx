import { FC, memo, useEffect, useMemo, useState } from 'react';
import { trackEvent } from 'oprojekte-analytics-sdk';
import { useT } from '~/utils/i18n';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import { SectionHeader } from '@/components/ui/typography/SectionHeader';
import { Button } from '~/components/ui';
import { useAIMetadata } from '@/lib/ai-explain/useAIMetadata';
import { tString, type TFunc } from '@/locales/helpers';

// Utility function to combine class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Interface for FAQ item data structure
export interface FAQItemData {
  id: string; // stabile Anchor-ID pro Frage
  question: string;
  answer: string;
}

// HTML zu Plaintext (für JSON-LD)
const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// JSON-LD für FAQPage generieren
const buildFAQJsonLd = (items: FAQItemData[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((it) => ({
    '@type': 'Question',
    name: stripHtml(it.question),
    acceptedAnswer: {
      '@type': 'Answer',
      text: stripHtml(it.answer),
    },
  })),
});

/**
 * FAQItem component that renders a single FAQ question and answer
 */
const FAQItem: FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  anchorId?: string;
  idSlug: string;
}> = ({ question, answer, isOpen, onToggle, index, anchorId, idSlug }) => {
  const questionId = `faq-q-${idSlug}`;
  const buttonId = `faq-btn-${idSlug}`;
  const panelId = `faq-panel-${idSlug}`;
  return (
    <motion.div
      id={anchorId}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={IN_VIEW_ONCE}
      transition={{ duration: 0.5 }}
      className="transition-colors duration-200"
    >
      <button
        id={buttonId}
        className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 md:px-4 md:py-4"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-labelledby={questionId}
      >
        <span id={questionId} className="text-left text-sm font-medium text-white md:text-[0.95rem]">
          {question}
        </span>
        <span className="ml-4 flex-shrink-0">
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="h-4 w-4 text-[rgb(var(--accent))]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </motion.svg>
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
            role="region"
            aria-labelledby={questionId}
            aria-live="polite"
          >
            <div
              className="px-3 pb-2 text-[0.9rem] leading-snug text-gray-300 md:text-[0.93rem]"
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * FAQSection component that displays a list of frequently asked questions
 */
// Get FAQ items with translations (SEO-optimiert)
export const getFAQItems = (t: TFunc): FAQItemData[] => [
  {
    id: 'pricing',
    question: tString(t, 'landing.faq.q_pricing'),
    answer: tString(t, 'landing.faq.a_pricing'),
  },
  {
    id: 'trial',
    question: tString(t, 'landing.faq.q_trial'),
    answer: tString(t, 'landing.faq.a_trial'),
  },
  {
    id: 'security',
    question: tString(t, 'landing.faq.q_security'),
    answer: tString(t, 'landing.faq.a_security'),
  },
  {
    id: 'deployment',
    question: tString(t, 'landing.faq.q_deployment'),
    answer: tString(t, 'landing.faq.a_deployment'),
  },
  {
    id: 'integrations',
    question: tString(t, 'landing.faq.q_integrations'),
    answer: tString(t, 'landing.faq.a_integrations'),
  },
  {
    id: 'customization',
    question: tString(t, 'landing.faq.q_customization'),
    answer: tString(t, 'landing.faq.a_customization'),
  },
  {
    id: 'quality',
    question: tString(t, 'landing.faq.q_accuracy'),
    answer: tString(t, 'landing.faq.a_accuracy'),
  },
  {
    id: 'compliance',
    question: tString(t, 'landing.faq.q_compliance'),
    answer: tString(t, 'landing.faq.a_compliance'),
  },
  {
    id: 'models',
    question: tString(t, 'landing.faq.q_models'),
    answer: tString(t, 'landing.faq.a_models'),
  },
  {
    id: 'sla',
    question: tString(t, 'landing.faq.q_sla'),
    answer: tString(t, 'landing.faq.a_sla'),
  },
  {
    id: 'cancellation',
    question: tString(t, 'landing.faq.q_cancellation'),
    answer: tString(t, 'landing.faq.a_cancellation'),
  },
  {
    id: 'mas',
    question: tString(t, 'landing.faq.q_mas'),
    answer: tString(t, 'landing.faq.a_mas'),
  },
  {
    id: 'agents-vs-mas',
    question: tString(t, 'landing.faq.q_agents_vs_mas'),
    answer: tString(t, 'landing.faq.a_agents_vs_mas'),
  },
  {
    id: 'billing',
    question: tString(t, 'landing.faq.q_billing'),
    answer: tString(t, 'landing.faq.a_billing'),
  },
  {
    id: 'limits',
    question: tString(t, 'landing.faq.q_limits'),
    answer: tString(t, 'landing.faq.a_limits'),
  },
  {
    id: 'data-residency',
    question: tString(t, 'landing.faq.q_data_residency'),
    answer: tString(t, 'landing.faq.a_data_residency'),
  },
  {
    id: 'api-sdk',
    question: tString(t, 'landing.faq.q_api_sdk'),
    answer: tString(t, 'landing.faq.a_api_sdk'),
  },
  {
    id: 'onboarding',
    question: tString(t, 'landing.faq.q_onboarding'),
    answer: tString(t, 'landing.faq.a_onboarding'),
  },
];

// Get section texts with translations
const getSectionTexts = (t: TFunc) => ({
  title: tString(t, 'landing.faq.title'),
  subtitle: tString(t, 'landing.faq.subtitle'),
  description: tString(t, 'landing.faq.description'),
  moreQuestions: tString(t, 'landing.faq.more_questions'),
  contactUs: tString(t, 'landing.faq.contact_us'),
});

const FAQSection: FC = () => {
  const t = useT();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefersReduced = useReducedMotion() ?? false;

  // Get translated content (sicher via i18n-Helper)
  const faqItems = useMemo(() => getFAQItems(t as unknown as TFunc), [t]);
  const sectionTexts = useMemo(() => getSectionTexts(t as unknown as TFunc), [t]);
  const faqJsonLd = useMemo(() => buildFAQJsonLd(faqItems), [faqItems]);

  // Hilfsfunktion: Anchor-ID für Item
  const getAnchorId = (idx: number) => `faq-${faqItems[idx].id}`;

  // Kompakter: Zwei Spalten ab MD, dafür benötigen wir Original-Indizes
  const entries = useMemo(() => faqItems.map((it, idx) => ({ it, idx })), [faqItems]);
  const columns = useMemo(
    () => [entries.filter((e) => e.idx % 2 === 0), entries.filter((e) => e.idx % 2 === 1)],
    [entries],
  );

  // Register AI Explainability metadata
  useAIMetadata({
    file: 'client/src/components/Landing/Sections/FAQSection.tsx',
    section: {
      id: 'faq-section',
      title: sectionTexts.title,
      description: sectionTexts.description,
      actions: ['accordion-toggle', 'navigate-contact'],
      breakpoints: {
        sm: { layout: 'stack', notes: 'Akkordeon, vertikal gestapelt.' },
        lg: { layout: 'stack', notes: 'Akkordeon, großzügige Abstände.' },
      },
    },
  });

  const toggleFAQ = (index: number) => {
    const willOpen = openIndex !== index;
    setOpenIndex(willOpen ? index : null);
    try {
      const newHash = willOpen ? `#${getAnchorId(index)}` : '#faq';
      if (typeof window !== 'undefined') {
        if (window.location.hash !== newHash) {
          window.history.pushState(null, '', newHash);
        }
      }
      // Analytics: manuelles Öffnen/Schließen tracken (SDK-Objekt-API)
      const idSlug = faqItems[index]?.id;
      if (idSlug) {
        trackEvent({
          type: 'faq_toggle',
          payload: {
            id: idSlug,
            action: willOpen ? 'open' : 'close',
            hash: newHash,
            source: 'click',
          },
        });
      }
    } catch {
      // Hash-Update ist optional; bei CSP/SSR-Edge-Cases einfach still ignorieren
    }
  };

  // Hash-Handling: #faq-<id> öffnet passende Frage und scrollt zur Section
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash;
      if (!hash || !hash.startsWith('#faq-')) return;
      const targetId = hash.slice(1); // ohne '#'
      const idx = faqItems.findIndex((f) => `faq-${f.id}` === targetId);
      if (idx >= 0) {
        setOpenIndex(idx);
        // Analytics: Auto-Open via Hash (SDK-Objekt-API)
        const idSlug = faqItems[idx]?.id;
        if (idSlug) {
          trackEvent({
            type: 'faq_hash_open',
            payload: {
              id: idSlug,
              hash,
              source: 'hash',
            },
          });
        }
      }
      const target = document.getElementById(targetId) || document.getElementById('faq');
      if (target?.scrollIntoView) {
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }
    };

    // Initial anwenden und bei Hash-Änderung reagieren
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [faqItems, prefersReduced]);

  // Fokus auf den geöffneten FAQ-Button setzen (A11y)
  useEffect(() => {
    if (openIndex == null || openIndex < 0) return;
    const idSlug = faqItems[openIndex]?.id;
    if (!idSlug) return;
    const btn = document.getElementById(`faq-btn-${idSlug}`) as HTMLButtonElement | null;
    btn?.focus({ preventScroll: true });
  }, [openIndex, faqItems]);

  return (
    <LandingSection
      className="bg-transparent overflow-hidden"
      bleed={false}
      divider="none"
      ariaLabel={sectionTexts.title}
      aria-labelledby="faq-heading"
      dataSection="faq-section"
      data-ai-section="faq-section"
      data-ai-title={sectionTexts.title}
      data-ai-purpose={sectionTexts.subtitle}
      accentTopGlow
    >
      <motion.div
        className={`text-center`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: 0.5 }}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 420px' }}
      >
        <div className="mx-auto mb-1 max-w-4xl text-center">
          <SectionHeader
            align="center"
            size="h2"
            title={sectionTexts.title}
            subtitle={sectionTexts.subtitle}
          />
        </div>
        {/* JSON-LD für FAQ Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <p className="hidden text-sm leading-snug text-gray-400 md:mb-4 md:block lg:mb-6">
          {sectionTexts.description}
        </p>
      </motion.div>

      <motion.div
        className="mx-auto mt-1 grid max-w-5xl grid-cols-1 gap-3 md:mt-2 md:grid-cols-2 md:gap-4 lg:gap-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 560px' }}
      >
        {columns.map((col, colIdx) => (
          <div key={`faq-col-${colIdx}`} className="space-y-2 md:space-y-3 lg:space-y-3.5">
            {col.map(({ it, idx }) => (
              <FAQItem
                key={idx}
                question={it.question}
                answer={it.answer}
                isOpen={openIndex === idx}
                onToggle={() => toggleFAQ(idx)}
                index={idx}
                anchorId={getAnchorId(idx)}
                idSlug={it.id}
              />
            ))}
          </div>
        ))}
      </motion.div>

      <motion.div
        className="mt-6 text-center md:mt-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 120px' }}
      >
        <p className="mb-1 text-sm font-medium text-gray-300 md:text-base">
          {sectionTexts.moreQuestions}
        </p>
        <Button
          asChild
          size="lg"
          className="inline-flex"
          data-ai-element="cta-contact"
          data-ai-label={sectionTexts.contactUs}
          onClick={() => {
            try {
              trackEvent({
                type: 'faq_contact_click',
                payload: { section: 'faq', label: sectionTexts.contactUs },
              });
            } catch {}
          }}
          aria-label={sectionTexts.contactUs}
        >
          <a href="#contact">{sectionTexts.contactUs}</a>
        </Button>
      </motion.div>
    </LandingSection>
  );
};

export default memo(FAQSection);
