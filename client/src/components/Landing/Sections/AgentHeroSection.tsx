import { FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { HeroActions } from './HeroActions';

// Define the type for our features
interface FeatureItem {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

// Extend i18next types
declare module 'i18next' {
  interface CustomTypeOptions {
    returnObjects: true;
    defaultNS: 'translation';
  }
}

interface AgentHeroSectionProps {
  onLearnMore: () => void;
}

const AgentHeroSection: FC<AgentHeroSectionProps> = ({ onLearnMore }) => {
  const { t } = useTranslation(['translation', 'landing']);
  const prefersReducedMotion = useReducedMotion() ?? false;
  
  // Get features from translations with type assertion
  const features = t('landing.agents.hero.features', { 
    returnObjects: true,
    defaultValue: []
  }) as unknown as FeatureItem[];
  
  // Icons für die Features zuweisen
  const featuresWithIcons = features.map((feature, index) => ({
    ...feature,
    icon: <Zap className="w-5 h-5" />
  }));

  const scrollToDemo = () => {
    const demoSection = document.getElementById('agent-demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12 sm:py-16 md:py-20 lg:py-28 border-t border-gray-800/50">
      {/* Dekorative Elemente - respektiert Reduced Motion */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden opacity-5 sm:opacity-10">
          <div className="absolute -right-10 sm:-right-20 -top-10 sm:-top-20 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-blue-500/80 rounded-full mix-blend-multiply filter blur-xl sm:blur-2xl lg:blur-3xl" />
          <div className="absolute -left-10 sm:-left-20 -bottom-10 sm:-bottom-20 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-purple-500/80 rounded-full mix-blend-multiply filter blur-xl sm:blur-2xl lg:blur-3xl" />
        </div>
      )}
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur mb-6"
          >
            <Zap className="w-4 h-4 mr-2" />
            {t('landing.agents.hero.badge' as any) as unknown as string}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-100"
          >
            {t('landing.agents.hero.title' as any) as unknown as string}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-300 leading-relaxed mt-3"
          >
            {t('landing.agents.hero.subtitle' as any) as unknown as string}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 sm:mt-6 flex justify-center"
          >
            <HeroActions
              onPrimaryClick={onLearnMore}
              onSecondaryClick={scrollToDemo}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 sm:mt-8 grid gap-4 text-left"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AgentHeroSection;
