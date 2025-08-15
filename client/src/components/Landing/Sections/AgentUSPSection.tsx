import HeroActions from './HeroActions';
import LandingSection, { IN_VIEW_ONCE } from './LandingSection';
import HeadingBlock from '@/components/ui/HeadingBlock';
import { useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics/track';
import { getVariantForKey } from '@/lib/ab/variant';

// Icons
import {
  Zap,
  Shield,
  Lightbulb,
  Users,
  BarChart2,
  Settings,
  Code,
  MessageSquare,
  Clock,
  Rocket,
  Check,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useT } from '~/utils/i18n';
import { Badge } from '~/components/ui/Badge';

// Hinweis: Alle i18n-Keys sind vollqualifiziert als 'landing.*'.

// Typen für die Komponenten-Props
interface AgentUSPSectionProps {
  className?: string;
}

// Typen für die USP-Karten
interface USPItem {
  id: string;
  title: string;
  description: string;
  stat?: string;
  features?: Array<{
    title: string;
    description: string;
  }>;
  color: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

// Typen für Erfolgsgeschichten
interface SuccessStory {
  id: string;
  title: string;
  description: string;
  company: string;
  role: string;
  metrics: Array<{
    value: string;
    label: string;
  }>;
  icon: React.ReactNode;
}

// Typen für Statistik-Karten
interface StatItem {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Animation Variants
// -----------------------------------------------------------------------------
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
const AgentUSPSection: React.FC<AgentUSPSectionProps> = ({ className }) => {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  // Dev-only diagnostics: verify target and nearest scrollable parent positioning
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const el = sectionRef.current as HTMLElement | null;
    if (!el) return;
    const cs = window.getComputedStyle(el);
    if (cs.position === 'static') {
      // eslint-disable-next-line no-console
      console.warn('[useScroll][AgentUSPSection] target has static position', {
        id: el.id,
        className: el.className,
        position: cs.position,
      });
    }
    let p: HTMLElement | null = el.parentElement as HTMLElement | null;
    while (p && p !== document.body) {
      const pcs = window.getComputedStyle(p);
      const scrollable =
        ['auto', 'scroll', 'overlay'].includes(pcs.overflowY) ||
        ['auto', 'scroll', 'overlay'].includes(pcs.overflowX);
      if (scrollable) {
        if (pcs.position === 'static') {
          // eslint-disable-next-line no-console
          console.warn('[useScroll][AgentUSPSection] scrollable parent is static', {
            tag: p.tagName.toLowerCase(),
            id: p.id,
            className: p.className,
            position: pcs.position,
            overflowY: pcs.overflowY,
            overflowX: pcs.overflowX,
          });
        }
        break;
      }
      p = p.parentElement as HTMLElement | null;
    }
  }, []);

  // Keine Fallback-Helper mehr – t() liefert Strings, Objekte via returnObjects bei Bedarf

  // Helper functions for icons and colors
  const getIconComponent = (iconName: string): React.ElementType => {
    const iconMap: Record<string, React.ElementType> = {
      zap: Zap,
      shield: Shield,
      lightbulb: Lightbulb,
      rocket: Rocket,
      clock: Clock,
      users: Users,
      'bar-chart': BarChart2,
      settings: Settings,
      code: Code,
      'message-square': MessageSquare,
    };
    return iconMap[iconName] || Zap; // Fallback to Zap icon
  };

  const getColorScheme = (colorName: string) => {
    const schemes = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
      },
      brand: {
        bg: 'bg-[rgb(var(--accent))]/10 dark:bg-[rgb(var(--accent))]/15',
        text: 'text-[rgb(var(--accent))]',
        border: 'border-[rgb(var(--accent-ring))]/40',
        hover: 'hover:bg-[rgb(var(--accent))]/15 dark:hover:bg-[rgb(var(--accent))]/20',
      },
      // Add more color schemes as needed
    };
    // Map "purple"-Wünsche auf Brand-Purple
    const key = (colorName === 'purple' ? 'brand' : colorName) as keyof typeof schemes;
    return schemes[key] || schemes.blue;
  };

  // Farben & Icons zyklisch zuordnen
  const colorSchemes = [
    {
      color: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      icon: <Zap className="h-6 w-6" />,
    },
    {
      color: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      icon: <Code className="h-6 w-6" />,
    },
    {
      color: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      icon: <ShieldCheck className="h-6 w-6" />,
    },
    {
      color: 'from-[rgb(var(--accent))]/10 to-[rgb(var(--accent))]/5',
      borderColor: 'border-[rgb(var(--accent-ring))]/40',
      iconBg: 'bg-[rgb(var(--accent))]/10',
      iconColor: 'text-[rgb(var(--accent))]',
      icon: <BarChart2 className="h-6 w-6" />,
    },
  ];

  // USP-Karten mit Typisierung
  const usps = useMemo<USPItem[]>(() => {
    type USPItemData = Omit<USPItem, 'icon' | 'color'> & {
      iconName: string;
      colorName: string;
    };

    const items =
      (t('landing.agents.usps.items', { returnObjects: true }) as unknown as USPItemData[]) ?? [];

    return items.map((item) => {
      const IconComponent = getIconComponent(item.iconName || '');
      const color = getColorScheme(item.colorName || 'blue').bg;

      return {
        ...item,
        icon: <IconComponent className="h-6 w-6" />,
        color,
      };
    });
  }, [t]);

  // Erfolgsgeschichten (mit Default-Metriken)
  const successStories = useMemo<SuccessStory[]>(() => {
    const stories =
      (t('landing.agents.successStories', { returnObjects: true }) as unknown as Array<{
        id: string;
        title: string;
        description: string;
        company: string;
        role: string;
        metrics?: Array<{ value: string; label: string }>;
      }>) ?? [];

    const icons = [
      <Code className="h-5 w-5 text-blue-500" key="code-icon" />,
      <TrendingUp className="h-5 w-5 text-emerald-500" key="trending-icon" />,
      <Clock className="h-5 w-5 text-amber-500" key="clock-icon" />,
    ];

    const defaultMetrics = [
      {
        value: '40%',
        label: t('landing.agents.metrics.fasterDevelopment'),
      },
      {
        value: '65%',
        label: t('landing.agents.metrics.fewerBugs'),
      },
      {
        value: '30%',
        label: t('landing.agents.metrics.fasterTimeToMarket'),
      },
    ];

    return stories.map((story, index) => ({
      ...story,
      metrics: story.metrics || defaultMetrics,
      icon: icons[index % icons.length],
    }));
  }, [t]);

  // Statistik-Karten mit Typisierung
  const stats = useMemo<StatItem[]>(
    () => [
      {
        value: '24/7',
        label: t('landing.agents.stats.availability'),
        description: t('landing.agents.stats.availabilityDesc'),
        icon: <Clock className="h-6 w-6 text-amber-500" />,
      },
      {
        value: '99.9%',
        label: t('landing.agents.stats.reliability'),
        description: t('landing.agents.stats.reliabilityDesc'),
        icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
      },
      {
        value: '50+',
        label: t('landing.agents.stats.integrations'),
        description: t('landing.agents.stats.integrationsDesc'),
        icon: <Code className="h-6 w-6 text-blue-500" />,
      },
      {
        value: '10x',
        label: t('landing.agents.stats.efficiency'),
        description: t('landing.agents.stats.efficiencyDesc'),
        icon: <Zap className="h-6 w-6 text-[rgb(var(--accent))]" />,
      },
    ],
    [t],
  );

  // Variant für A/B Attribution (Experiment-Key: 'usp')
  const variant = getVariantForKey('usp');

  return (
    <LandingSection
      ref={sectionRef as any}
      className="relative overflow-hidden bg-transparent"
      ariaLabel={t('landing.agents.header.title') as string}
      dataSection="agents-usp"
    >
      {/* Dekorative Elemente mit Parallax (bei Reduced Motion deaktiviert) */}
      {/* Decorative gradient blobs removed for neutrality/performance */}

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ ...IN_VIEW_ONCE, margin: '-100px' }}
          variants={container}
          className={`text-center`}
          style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 360px' }}
        >
          <HeadingBlock align="center">
            <motion.span variants={item} className="mb-6 inline-flex">
              <Badge
                size="sm"
                tone="soft"
                variant="features"
                className="whitespace-nowrap py-1 sm:py-1"
                leadingIcon={<Sparkles className="h-3.5 w-3.5" aria-hidden />}
              >
                {t('landing.agents.header.title')}
              </Badge>
            </motion.span>

            <motion.h2
              variants={item}
              className="mb-6 text-3xl font-bold leading-tight tracking-tight text-gray-100 md:text-6xl"
            >
              {t('landing.agents.header.subtitle')}
            </motion.h2>

            <motion.p
              variants={item}
              className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-600 dark:text-gray-300"
            >
              {t('landing.agents.header.description')}
            </motion.p>
          </HeadingBlock>
        </motion.div>

        {/* USP Karten */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ ...IN_VIEW_ONCE, margin: '-100px' }}
          className="mb-20 md:mb-24 grid grid-cols-1 gap-8 md:gap-10 lg:gap-12 md:grid-cols-2 lg:grid-cols-4"
        >
          {usps.map((usp, index) => (
            <motion.div
              key={`usp-${index}`}
              variants={item}
              className="group rounded-xl bg-transparent p-6 ring-1 ring-inset ring-white/10 transition-shadow duration-300 hover:shadow-xl"
            >
              {/* Icon */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
                {usp.icon}
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{usp.title}</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">{usp.description}</p>

              {/* Features */}
              {Array.isArray(usp.features) && usp.features.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                  {usp.features.map((feature, i) => (
                    <div key={`usp-${index}-f-${i}`} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
                      <div className="text-sm">
                        {!!feature?.title && (
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {feature.title}
                          </div>
                        )}
                        {!!feature?.description && (
                          <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hover Action */}
              <div className="mt-6 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <button
                  type="button"
                  aria-label={t('landing.cta.secondary')}
                  className="inline-flex items-center text-sm font-medium text-gray-200 hover:text-white"
                  onClick={() => {
                    track({
                      name: 'usp_hover_cta_click',
                      props: { to: '/docs', variant, cardIndex: index, cardId: usp.id },
                    });
                    navigate('/docs');
                  }}
                >
                  <span className="font-medium">{t('landing.cta.secondary')}</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Erfolgsgeschichten */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ ...IN_VIEW_ONCE, margin: '-100px' }}
          className="mb-20 md:mb-24"
        >
          <div className="relative rounded-xl bg-transparent p-8 ring-1 ring-inset ring-white/10">
            <div className="grid grid-cols-1 gap-8 md:gap-10 lg:gap-12 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div key={`stat-${index}`} variants={item} className="group text-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15',
                        !prefersReducedMotion &&
                          'transition-transform duration-300 group-hover:scale-110',
                      )}
                    >
                      <div className="text-white transition-colors duration-300">{stat.icon}</div>
                    </div>
                    <div className="mb-2 text-4xl font-bold text-white">{stat.value}</div>
                    <h3 className="text-2xl font-bold text-white">{stat.label}</h3>
                    <p className="mx-auto max-w-xs text-sm text-blue-100/80">{stat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* CTA Button */}
            <motion.div variants={item} className="mt-12 text-center">
              <HeroActions
                className="mt-0 justify-center"
                onPrimaryClick={() => {}}
                onSecondaryClick={() => {}}
                groupLabel={t('landing.cta.groupLabel')}
              />
              <p className="mt-4 text-sm text-blue-100/70">{t('landing.cta.noCreditCard')}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={IN_VIEW_ONCE}
          transition={{ duration: 0.5 }}
          className={`text-center`}
          style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 240px' }}
        >
          <HeadingBlock align="center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
              {t('landing.agents.usps.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-300">
              {t('landing.agents.usps.subtitle')}
            </p>
            <HeroActions
              className="mt-8 justify-center"
              onPrimaryClick={() => {}}
              onSecondaryClick={() => {}}
              groupLabel={t('landing.cta.groupLabel')}
            />
          </HeadingBlock>
        </motion.div>
      </div>
    </LandingSection>
  );
};

export default AgentUSPSection;
