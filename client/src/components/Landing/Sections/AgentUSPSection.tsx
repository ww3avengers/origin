import { HeroActions } from './HeroActions';
import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
import { useTranslation, UseTranslationResponse } from 'react-i18next';
import { TFunction } from 'i18next';

// Type for translation keys
type TranslationKeys = 
  | 'landing.agents.usps.items'
  | 'landing.agents.successStories'
  | 'landing.agents.metrics.fasterDevelopment'
  | 'landing.agents.metrics.fewerBugs'
  | 'landing.agents.metrics.fasterTimeToMarket'
  | 'landing.agents.cta.freeTrial'
  | 'landing.agents.cta.noCreditCard'
  | 'landing.agents.cta.start'
  | 'landing.agents.successStoriesTitle'
  | 'landing.agents.successStoriesSubtitle'
  | 'landing.agents.usps.title'
  | 'landing.agents.usps.subtitle'
  | 'landing.agents.header.title'
  | 'landing.agents.header.subtitle'
  | 'landing.agents.header.description'
  | 'landing.agents.stats.availability'
  | 'landing.agents.stats.availabilityDesc'
  | 'landing.agents.stats.reliability'
  | 'landing.agents.stats.reliabilityDesc'
  | 'landing.agents.stats.integrations'
  | 'landing.agents.stats.integrationsDesc'
  | 'landing.agents.stats.efficiency'
  | 'landing.agents.stats.efficiencyDesc'
  | 'common.learnMore';

// Simplified type for the useTranslation hook with our keys
type UseTranslationResponseTyped = {
  t: {
    (key: string, defaultValue?: string, options?: { ns?: string }): string;
    <T = any>(key: string, defaultValue: T, options: { ns?: string; returnObjects: true }): T;
  };
  i18n: any;
  ready: boolean;
};

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
  const { t } = useTranslation(['translation', 'landing']) as unknown as UseTranslationResponseTyped;
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  // Typisierte Hilfsfunktion für sichere Übersetzungen
  const translate = <T = string>(
    key: string,
    fallback: T,
    options: { returnObjects?: boolean } = {}
  ): T => {
    try {
      const finalKey = key.startsWith('landing.') ? key.substring(8) : key;
      
      if (options.returnObjects) {
        // @ts-ignore - i18next-Typen sind nicht perfekt mit Generics kompatibel
        const result = t(finalKey, { 
          ...options, 
          ns: 'landing',
          returnObjects: true,
          defaultValue: JSON.stringify(fallback)
        } as any);
        return typeof result === 'string' ? JSON.parse(result) : result;
      }
      
      const result = t(finalKey, { 
        ns: 'landing',
        defaultValue: String(fallback)
      } as any);
      
      return (result === finalKey ? fallback : result) as unknown as T;
    } catch (error) {
      console.warn(`Übersetzung für ${key} fehlgeschlagen:`, error);
      return fallback;
    }
  };

  // Helper functions for icons and colors
  const getIconComponent = (iconName: string): React.ElementType => {
    const iconMap: Record<string, React.ElementType> = {
      'zap': Zap,
      'shield': Shield,
      'lightbulb': Lightbulb,
      'rocket': Rocket,
      'clock': Clock,
      'users': Users,
      'bar-chart': BarChart2,
      'settings': Settings,
      'code': Code,
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
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
      },
      // Add more color schemes as needed
    };
    return schemes[colorName as keyof typeof schemes] || schemes.blue;
  };

  // Farben & Icons zyklisch zuordnen
  const colorSchemes = [
    {
      color: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      icon: <Zap className="w-6 h-6" />,
    },
    {
      color: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      icon: <Code className="w-6 h-6" />,
    },
    {
      color: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      icon: <ShieldCheck className="w-6 h-6" />,
    },
    {
      color: 'from-purple-500/10 to-purple-500/5',
      borderColor: 'border-purple-500/20',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      icon: <BarChart2 className="w-6 h-6" />,
    },
  ];

  // USP-Karten mit Typisierung
  const usps = useMemo<USPItem[]>(() => {
    type USPItemData = Omit<USPItem, 'icon' | 'color'> & { 
      iconName: string; 
      colorName: string;
    };
    
    const items = translate<USPItemData[]>(
      'landing.agents.usps.items',
      [],
      { returnObjects: true }
    );
    
    return items.map((item) => {
      const IconComponent = getIconComponent(item.iconName || '');
      const color = getColorScheme(item.colorName || 'blue').bg;
      
      return {
        ...item,
        icon: <IconComponent className="h-6 w-6" />,
        color,
      };
    });
  }, [translate]);

  // Erfolgsgeschichten (mit Default-Metriken)
  const successStories = useMemo<SuccessStory[]>(() => {
    const stories = translate<Array<{
      id: string;
      title: string;
      description: string;
      company: string;
      role: string;
      metrics?: Array<{ value: string; label: string }>;
    }>>('landing.agents.successStories', [], { returnObjects: true });

    const icons = [
      <Code className="w-5 h-5 text-blue-500" key="code-icon" />,
      <TrendingUp className="w-5 h-5 text-emerald-500" key="trending-icon" />,
      <Clock className="w-5 h-5 text-amber-500" key="clock-icon" />,
    ];

    const defaultMetrics = [
      { 
        value: '40%', 
        label: translate('landing.agents.metrics.fasterDevelopment', 'Schnellere Entwicklung') 
      },
      { 
        value: '65%', 
        label: translate('landing.agents.metrics.fewerBugs', 'Weniger Bugs') 
      },
      { 
        value: '30%', 
        label: translate('landing.agents.metrics.fasterTimeToMarket', 'Kürzere Time-to-Market') 
      },
    ];

    return stories.map((story, index) => ({
      ...story,
      metrics: story.metrics || defaultMetrics,
      icon: icons[index % icons.length]
    }));
  }, [translate]);

  // Statistik-Karten mit Typisierung
  const stats = useMemo<StatItem[]>(() => [
    {
      value: '24/7',
      label: translate('landing.agents.stats.availability', 'Verfügbarkeit'),
      description: translate(
        'landing.agents.stats.availabilityDesc',
        'Rund um die Uhr einsatzbereit, an 365 Tagen im Jahr.'
      ),
      icon: <Clock className="w-6 h-6 text-amber-500" />,
    },
    {
      value: '99.9%',
      label: translate('landing.agents.stats.reliability', 'Zuverlässigkeit'),
      description: translate(
        'landing.agents.stats.reliabilityDesc',
        'Höchste Verfügbarkeit durch ausfallsichere Infrastruktur.'
      ),
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    },
    {
      value: '50+',
      label: translate('landing.agents.stats.integrations', 'Integrationen'),
      description: translate(
        'landing.agents.stats.integrationsDesc',
        'Nahtlose Einbindung in Ihre bestehenden Tools und Workflows.'
      ),
      icon: <Code className="w-6 h-6 text-blue-500" />,
    },
    {
      value: '10x',
      label: translate('landing.agents.stats.efficiency', 'Effizienzsteigerung'),
      description: translate(
        'landing.agents.stats.efficiencyDesc',
        'Bis zu 10x schnellere Ergebnisse als herkömmliche Lösungen.'
      ),
      icon: <Zap className="w-6 h-6 text-purple-500" />,
    },
  ], [translate]);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      {/* Dekorative Elemente mit Parallax (bei Reduced Motion deaktiviert) */}
      {!prefersReducedMotion && (
        <motion.div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ y: y1 }}>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/5 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute top-1/2 -right-48 w-96 h-96 bg-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-amber-500/5 rounded-full mix-blend-multiply filter blur-3xl" />
        </motion.div>
      )}

      <div className="container relative mx-auto px-4 z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={container}
          className="text-center mb-20"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {translate('landing.agents.header.title', 'Die Zukunft der Arbeit beginnt hier')}
          </motion.span>

          <motion.h2
            variants={item}
            className="text-3xl md:text-6xl font-bold tracking-tight text-gray-100 mb-6 leading-tight"
          >
            {translate('landing.agents.header.subtitle', 'Intelligente KI-Agenten für Ihre Herausforderungen')}
          </motion.h2>

          <motion.p
            variants={item}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            {translate(
              'landing.agents.header.description',
              'Unsere KI-Agenten revolutionieren, wie Sie arbeiten – mit maßgeschneiderten Lösungen, die Produktivität steigern, Prozesse automatisieren und Innovationen beschleunigen.'
            )}
          </motion.p>
        </motion.div>

        {/* USP Karten */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-28"
        >
          {usps.map((usp, index) => (
            <motion.div
              key={`usp-${index}`}
              variants={item}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
            >
              {/* Icon */}
              <div className={cn('w-14 h-14 flex items-center justify-center rounded-xl mb-6', usp.iconBg, usp.iconColor)}>
                {usp.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{usp.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{usp.description}</p>

              {/* Features */}
              {Array.isArray(usp.features) && usp.features.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {usp.features.map((feature, i) => (
                    <div key={`usp-${index}-f-${i}`} className="flex items-start gap-2">
                      <Check className="mt-0.5 w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div className="text-sm">
                        {!!feature?.title && (
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {feature.title}
                          </div>
                        )}
                        {!!feature?.description && (
                          <p className="text-gray-600 dark:text-gray-300">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hover Action */}
              <div className="mt-6 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <button
                  type="button"
                  className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <span className="font-medium">{translate('common.learnMore', 'Mehr erfahren')}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
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
          viewport={{ once: true, margin: '-100px' }}
          className="mb-28"
        >
          <div className="text-center mb-12">
            <motion.h3 variants={item} className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {translate('landing.agents.successStoriesTitle', 'Erfolgsgeschichten')}
            </motion.h3>
            <motion.p variants={item} className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {translate(
                'landing.agents.successStoriesSubtitle',
                'Lesen Sie, wie Unternehmen mit unseren KI-Agenten ihre Prozesse revolutioniert haben:'
              )}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {successStories.map((story: any, index: number) => (
              <motion.div
                key={`story-${index}`}
                variants={item}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 mr-3">
                    {story.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{story.title}</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{story.description}</p>
                <div className="grid grid-cols-3 gap-2">
                  {story.metrics.map((metric: any, i: number) => (
                    <div key={`metric-${index}-${i}`} className="text-center">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{metric.value}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Statistik-Banner */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="relative overflow-hidden rounded-2xl mb-28 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-0.5"
        >
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-2xl opacity-20 blur-lg" />

          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div key={`stat-${index}`} variants={item} className="text-center group">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4',
                        !prefersReducedMotion && 'group-hover:scale-110 transition-transform duration-300'
                      )}
                    >
                      <div className="group-hover:text-white transition-colors duration-300">{stat.icon}</div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{stat.label}</h3>
                    <p className="text-sm text-blue-100/80 max-w-xs mx-auto">{stat.description}</p>
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
                groupLabel={translate('landing.agents.cta.groupLabel', 'Aktionen: Jetzt starten oder mehr erfahren')}
              />
              <p className="mt-4 text-sm text-blue-100/70">{translate('landing.agents.cta.noCreditCard', 'Keine Kreditkarte erforderlich')}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100">
            {translate('landing.agents.usps.title', 'Warum Unternehmen auf unsere KI-Agenten setzen')}
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            {translate(
              'landing.agents.usps.subtitle',
              'Unsere KI-Agenten sind speziell darauf trainiert, komplexe Aufgaben zu automatisieren und wertvolle Erkenntnisse zu liefern - rund um die Uhr, an 365 Tagen im Jahr.'
            )}
          </p>
          <HeroActions
            className="mt-8 justify-center"
            onPrimaryClick={() => {}}
            onSecondaryClick={() => {}}
            groupLabel={translate('landing.agents.cta.groupLabel', 'Aktionen: Jetzt starten oder mehr erfahren')}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default AgentUSPSection;
