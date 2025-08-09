import { FC, ReactNode, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import HeroActions from './HeroActions';

// Typdefinitionen
interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  category: 'ai' | 'collaboration' | 'integration' | 'security';
}

// Icons als einfache Komponenten
const ModelsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.25 16.5h13.5l-4.341-5.091a2.25 2.25 0 01-.659-1.591V3.104M9.75 3.104a2.25 2.25 0 014.5 0v5.714a2.25 2.25 0 01-.659 1.591L13.5 11.25h3.75l-4.091-4.803a2.25 2.25 0 01-.659-1.591V3.104" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12.75h18M12 3v18" />
  </svg>
);

const ApiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

const SecurityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const TeamIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94-3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

// Feature-Komponente
const FeatureCard: FC<{ feature: Feature; delay: number; prefersReduced?: boolean }> = ({ feature, delay, prefersReduced = false }) => {
  return (
    <motion.article
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: prefersReduced ? 0 : 0.5,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${prefersReduced ? '' : 'hover:scale-[1.02]'} focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus:outline-none`}
      tabIndex={0}
      aria-labelledby={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}-title`}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />
      
      <div className="relative z-10">
        <div 
          className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
          aria-hidden="true"
        >
          {feature.icon}
        </div>
        
        <h3 
          id={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}-title`}
          className="mb-3 text-xl font-bold text-white"
        >
          {feature.title}
        </h3>
        
        <p className="text-gray-300">
          {feature.description}
        </p>
      </div>
    </motion.article>
  );
};

// Animation variants for better performance
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const FeaturesSection: FC = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;
  // i18n helper: ensures string return to satisfy TS types across UI
  const tt = useCallback((key: string, options?: Record<string, unknown>): string => {
    return String(t(key as any, options as any));
  }, [t]);

  // Kategorien für die Filterung
  const categories = [
    { id: 'all', name: tt('landing.features.categories.all') },
    { id: 'ai', name: tt('landing.features.categories.ai') },
    { id: 'collaboration', name: tt('landing.features.categories.collaboration') },
    { id: 'integration', name: tt('landing.features.categories.integration') },
    { id: 'security', name: tt('landing.features.categories.security') },
  ];

  // Features-Daten
  const features: Feature[] = [
    {
      title: tt('landing.features.ai.title'),
      description: tt('landing.features.ai.description'),
      icon: <ModelsIcon />,
      category: 'ai'
    },
    {
      title: tt('landing.features.security.title'),
      description: tt('landing.features.security.description'),
      icon: <SecurityIcon />,
      category: 'security'
    },
    {
      title: tt('landing.features.collaboration.title'),
      description: tt('landing.features.collaboration.description'),
      icon: <TeamIcon />,
      category: 'collaboration'
    },
    {
      title: tt('landing.features.integration.title'),
      description: tt('landing.features.integration.description'),
      icon: <ApiIcon />,
      category: 'integration'
    },
    {
      title: tt('landing.features.code.title'),
      description: tt('landing.features.code.description'),
      icon: <CodeIcon />,
      category: 'ai'
    },
    {
      title: tt('landing.features.analytics.title'),
      description: tt('landing.features.analytics.description'),
      icon: <AnalyticsIcon />,
      category: 'ai'
    }
  ];

  // Gefilterte Features basierend auf der ausgewählten Kategorie
  const filteredFeatures = useMemo(() => {
    if (activeCategory === 'all') return features;
    return features.filter(feature => feature.category === activeCategory);
  }, [activeCategory]);

  return (
    <section 
      className="relative overflow-hidden bg-gray-900 py-20 sm:py-24 lg:py-32"
      id="features"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2 
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: baseDuration }}
            id="features-heading"
          >
            {tt('landing.features.title')}
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-300"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.1 }}
          >
            {tt('landing.features.subtitle')}
          </motion.p>
        </div>

        {/* Kategorie-Filter */}
        <motion.div 
          className="mt-12 flex flex-wrap justify-center gap-3"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.2 }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <AnimatePresence>
            {filteredFeatures.map((feature, index) => (
              <FeatureCard 
                key={`${feature.title}-${index}`}
                feature={feature}
                delay={prefersReduced ? 0 : index * 0.1}
                prefersReduced={prefersReduced}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="mt-16 flex justify-center"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: baseDuration, delay: prefersReduced ? 0 : 0.3 }}
        >
          <HeroActions 
            onPrimaryClick={useCallback(() => {
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
              else window.location.assign('/contact');
            }, [prefersReduced])}
            onSecondaryClick={useCallback(() => {
              window.open('https://github.com/sigmacode-ai/sigmacode', '_blank', 'noopener,noreferrer');
            }, [])}
            groupLabel={`${tt('landing.features.title')} – ${tt('landing.features.cta')}`}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
