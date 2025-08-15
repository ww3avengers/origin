import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '~/utils/i18n';
import { motion, useReducedMotion } from 'framer-motion';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { SectionHeading } from '~/components/ui';
import { track } from '@/lib/analytics/track';
import { tString } from '@/locales/helpers';
import { getIcon, type IconComponent } from '~/components/ui';

// Übersetzungen: nutze direkt t() aus useT() mit vollqualifizierten Keys 'landing.*'

type TargetAudienceTab =
  | 'business'
  | 'developers'
  | 'creators'
  | 'ecommerce'
  | 'saas'
  | 'healthcare'
  | 'fintech'
  | 'legal';

const UseCasesSection: FC = () => {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TargetAudienceTab>('business');
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.4;
  const sectionRef = useRef<HTMLElement | null>(null);

  const tabData = useMemo(
    () => ({
      business: {
        title: tString(t, 'landing.target.business.title'),
        description: tString(t, 'landing.target.business.description'),
        features: [
          tString(t, 'landing.target.business.features.1'),
          tString(t, 'landing.target.business.features.2'),
          tString(t, 'landing.target.business.features.3'),
          tString(t, 'landing.target.business.features.4'),
          tString(t, 'landing.target.business.features.5'),
        ],
        icon: getIcon('company'),
        color: 'from-blue-500 to-indigo-600',
        accent: 'rgba(59,130,246,0.5)',
      },
      developers: {
        title: tString(t, 'landing.target.developers.title'),
        description: tString(t, 'landing.target.developers.description'),
        features: [
          tString(t, 'landing.target.developers.features.1'),
          tString(t, 'landing.target.developers.features.2'),
          tString(t, 'landing.target.developers.features.3'),
          tString(t, 'landing.target.developers.features.4'),
          tString(t, 'landing.target.developers.features.5'),
        ],
        icon: getIcon('developers'),
        color: 'from-emerald-500 to-teal-600',
        accent: 'rgba(16,185,129,0.5)',
      },
      creators: {
        title: tString(t, 'landing.target.creators.title'),
        description: tString(t, 'landing.target.creators.description'),
        features: [
          tString(t, 'landing.target.creators.features.1'),
          tString(t, 'landing.target.creators.features.2'),
          tString(t, 'landing.target.creators.features.3'),
          tString(t, 'landing.target.creators.features.4'),
          tString(t, 'landing.target.creators.features.5'),
        ],
        icon: getIcon('creators'),
        color: 'from-blue-500 to-indigo-600',
        accent: 'rgba(59,130,246,0.5)',
      },
      ecommerce: {
        title: tString(t, 'landing.target.ecommerce.title'),
        description: tString(t, 'landing.target.ecommerce.description'),
        features: [
          tString(t, 'landing.target.ecommerce.features.1'),
          tString(t, 'landing.target.ecommerce.features.2'),
          tString(t, 'landing.target.ecommerce.features.3'),
          tString(t, 'landing.target.ecommerce.features.4'),
          tString(t, 'landing.target.ecommerce.features.5'),
          tString(t, 'landing.target.ecommerce.features.6'),
        ],
        icon: getIcon('ecommerce'),
        color: 'from-amber-500 to-orange-600',
        accent: 'rgba(245,158,11,0.5)',
      },
      saas: {
        title: tString(t, 'landing.target.saas.title'),
        description: tString(t, 'landing.target.saas.description'),
        features: [
          tString(t, 'landing.target.saas.features.1'),
          tString(t, 'landing.target.saas.features.2'),
          tString(t, 'landing.target.saas.features.3'),
          tString(t, 'landing.target.saas.features.4'),
          tString(t, 'landing.target.saas.features.5'),
          tString(t, 'landing.target.saas.features.6'),
        ],
        icon: getIcon('saas'),
        color: 'from-blue-500 to-indigo-600',
        accent: 'rgba(59,130,246,0.5)',
      },
      healthcare: {
        title: tString(t, 'landing.target.healthcare.title'),
        description: tString(t, 'landing.target.healthcare.description'),
        features: [
          tString(t, 'landing.target.healthcare.features.1'),
          tString(t, 'landing.target.healthcare.features.2'),
          tString(t, 'landing.target.healthcare.features.3'),
          tString(t, 'landing.target.healthcare.features.4'),
          tString(t, 'landing.target.healthcare.features.5'),
          tString(t, 'landing.target.healthcare.features.6'),
        ],
        icon: getIcon('healthcare'),
        color: 'from-rose-500 to-pink-600',
        accent: 'rgba(244,63,94,0.5)',
      },
      fintech: {
        title: tString(t, 'landing.target.fintech.title'),
        description: tString(t, 'landing.target.fintech.description'),
        features: [
          tString(t, 'landing.target.fintech.features.1'),
          tString(t, 'landing.target.fintech.features.2'),
          tString(t, 'landing.target.fintech.features.3'),
          tString(t, 'landing.target.fintech.features.4'),
          tString(t, 'landing.target.fintech.features.5'),
          tString(t, 'landing.target.fintech.features.6'),
        ],
        icon: getIcon('fintech'),
        color: 'from-cyan-500 to-blue-600',
        accent: 'rgba(6,182,212,0.5)',
      },
      legal: {
        title: tString(t, 'landing.target.legal.title'),
        description: tString(t, 'landing.target.legal.description'),
        features: [
          tString(t, 'landing.target.legal.features.1'),
          tString(t, 'landing.target.legal.features.2'),
          tString(t, 'landing.target.legal.features.3'),
          tString(t, 'landing.target.legal.features.4'),
          tString(t, 'landing.target.legal.features.5'),
          tString(t, 'landing.target.legal.features.6'),
        ],
        icon: getIcon('legal'),
        color: 'from-blue-500 to-indigo-600',
        accent: 'rgba(59,130,246,0.5)',
      },
    }),
    [t],
  );

  const tabVariants = prefersReduced
    ? {
        active: { opacity: 1 },
        inactive: { opacity: 1 },
      }
    : {
        active: {
          opacity: 1,
          y: 0,
          transition: { duration: baseDuration },
        },
        inactive: {
          opacity: 0,
          y: 10,
          transition: { duration: baseDuration },
        },
      };

  // Hinweis: Obere CTA-Buttons wurden entfernt. Die Konversion erfolgt kontextuell je Tab unten.

  const sectionTitle = t('landing.target.title');

  // CTA-Konfiguration pro Tab (interne Verlinkung für SEO/UX)
  const ctaByTab: Record<TargetAudienceTab, { href: string; label: string }> = useMemo(
    () => ({
      business: { href: '#contact', label: t('landing.target.cta.contact') as string },
      developers: { href: '#agent-demo', label: t('landing.target.cta.demo') as string },
      creators: { href: '#contact', label: t('landing.target.cta.contact') as string },
      ecommerce: { href: '#pricing', label: t('landing.target.cta.pricing') as string },
      saas: { href: '#pricing', label: t('landing.target.cta.pricing') as string },
      healthcare: { href: '#contact', label: t('landing.target.cta.contact') as string },
      fintech: { href: '#contact', label: t('landing.target.cta.contact') as string },
      legal: { href: '#contact', label: t('landing.target.cta.contact') as string },
    }),
    [t],
  );

  // Deep-Linking & Persistenz (URL + localStorage)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const fromQuery = url.searchParams.get('use-cases');
      const fromHash = url.hash.startsWith('#use-cases=')
        ? url.hash.replace('#use-cases=', '')
        : null;
      const persisted = localStorage.getItem('usecases-active');
      const candidate = (fromQuery || fromHash || persisted) as TargetAudienceTab | null;
      if (candidate && candidate in tabData) {
        setActiveTab(candidate as TargetAudienceTab);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('use-cases', activeTab);
      window.history.replaceState({}, '', `${url.pathname}${url.search}`);
      localStorage.setItem('usecases-active', activeTab);
      track({ name: 'view_usecase_tab', props: { tab: activeTab } });
    } catch {}
  }, [activeTab]);

  // Section-View Impression (einmalig)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!fired && entry.isIntersecting) {
          fired = true;
          track({ name: 'view_usecases_section' });
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Hinweis: IDs werden direkt on-the-fly an Buttons/Panels gesetzt; separate Arrays entfallen

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = Object.keys(tabData) as Array<keyof typeof tabData>;
    const currentIndex = tabs.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = tabs[(currentIndex + 1) % tabs.length];
      setActiveTab(next);
      const btn = document.getElementById(`usecase-tab-${next}`) as HTMLButtonElement | null;
      btn?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      setActiveTab(prev);
      const btn = document.getElementById(`usecase-tab-${prev}`) as HTMLButtonElement | null;
      btn?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      const first = tabs[0];
      setActiveTab(first);
      const btn = document.getElementById(`usecase-tab-${first}`) as HTMLButtonElement | null;
      btn?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = tabs[tabs.length - 1];
      setActiveTab(last);
      const btn = document.getElementById(`usecase-tab-${last}`) as HTMLButtonElement | null;
      btn?.focus();
    }
  };

  return (
    <LandingSection
      id="use-cases"
      className="bg-transparent"
      bleed={false}
      ariaLabel={sectionTitle}
      aria-labelledby="usecases-heading"
      dataSection="use-cases"
      data-ai-section="use-cases"
      data-ai-title={sectionTitle}
      ref={(n) => (sectionRef.current = n)}
    >
      {/* JSON-LD für SEO: ItemList der Use-Cases (lokalisierte Titel/Beschreibungen) */}
      {(() => {
        const items = (Object.keys(tabData) as Array<keyof typeof tabData>).map((key, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tabData[key].title,
          description: tabData[key].description,
        }));
        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: sectionTitle,
          itemListElement: items,
        };
        return (
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        );
      })()}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={IN_VIEW_ONCE}
        transition={{ duration: baseDuration }}
        className="scroll-mt-24 text-center"
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 360px' }}
      >
        <HeadingBlock align="center">
          <SectionHeading
            id="usecases-heading"
            title={t('landing.target.title')}
            subtitle={t('landing.target.subtitle')}
            align="center"
          />
          <p className="mx-auto max-w-2xl text-[15px] leading-7 text-white/80">
            {t('landing.target.description')}
          </p>
        </HeadingBlock>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mx-auto mb-6 max-w-6xl">
        <div
          role="tablist"
          aria-label={sectionTitle}
          aria-orientation="horizontal"
          className="flex flex-wrap justify-center gap-2"
          onKeyDown={handleKeyDown}
        >
          {(Object.keys(tabData) as Array<keyof typeof tabData>).map((tab) => (
            <button
              key={tab}
              id={`usecase-tab-${tab}`}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`usecase-panel-${tab}`}
              tabIndex={activeTab === tab ? 0 : -1}
              className={`group flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                activeTab === tab
                  ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
                  : 'border border-transparent bg-transparent text-gray-300 hover:border-white/10 hover:bg-white/5 hover:text-gray-100'
              }`}
              onClick={() => setActiveTab(tab)}
              type="button"
              title={tabData[tab].title}
            >
              <span className="text-lg" aria-hidden="true">
                {(() => {
                  const Icon = tabData[tab].icon as IconComponent;
                  return <Icon className="h-4 w-4" aria-hidden />;
                })()}
              </span>
              <span className="inline max-w-[12ch] truncate text-[13px] font-medium sm:max-w-[14ch] md:max-w-[16ch] lg:max-w-none">
                {tabData[tab].title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative mx-auto max-w-6xl">
        {(Object.keys(tabData) as Array<keyof typeof tabData>)
          .filter((tab) => tab === activeTab)
          .map((tab) => (
            <motion.div
              key={tab}
              className="grid grid-cols-1 items-start gap-6"
              initial="inactive"
              animate="active"
              variants={tabVariants}
              role="tabpanel"
              id={`usecase-panel-${tab}`}
              aria-labelledby={`usecase-tab-${tab}`}
              tabIndex={0}
            >
              <div className="order-1">
                <div className="mb-6 inline-flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {(() => {
                      const Icon = tabData[tab].icon as IconComponent;
                      return <Icon className="h-6 w-6" aria-hidden />;
                    })()}
                  </span>
                  <h3 className="text-2xl font-semibold tracking-tight text-gray-100">
                    {tabData[tab].title}
                  </h3>
                </div>
                <p className="mb-5 border-l border-white/10 pl-3 text-[15px] leading-7 text-white/80">
                  {tabData[tab].description}
                </p>
                {/* semantische Liste statt Divs */}
                <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tabData[tab].features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-md transition-colors duration-150 hover:bg-white/5 focus-within:bg-white/5 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/30"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15">
                        <span className="text-[13px] text-white" aria-hidden>
                          ✓
                        </span>
                      </div>
                      <span className="text-sm text-white/90 dark:text-white/80">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA pro Tab: stärkt interne Verlinkung & Conversion */}
                <div className="mt-5">
                  {(() => {
                    const cta = ctaByTab[tab as TargetAudienceTab];
                    return (
                      <a
                        href={cta.href}
                        aria-label={`${sectionTitle}: ${tabData[tab].title} – ${cta.label}`}
                        onClick={() => {
                          track({ name: 'click_usecase_cta', props: { tab } });
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/15 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        {cta.label}
                        <span aria-hidden>→</span>
                      </a>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </LandingSection>
  );
};

export default UseCasesSection;
