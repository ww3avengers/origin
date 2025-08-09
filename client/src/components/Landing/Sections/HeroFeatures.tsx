import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, Shield, GitBranch, Rocket } from 'lucide-react';

type FeatureKey = 'ai' | 'security' | 'collaboration' | 'performance';

interface FeatureItem {
  id: FeatureKey;
  icon: React.ReactNode;
  titleKey: `features.items.${number}.title`;
  descriptionKey: `features.items.${number}.description`;
}

interface HeroFeaturesProps {
  className?: string;
  animationDuration?: number;
}

export const HeroFeatures = ({
  className,
  animationDuration = 0.5,
}: HeroFeaturesProps) => {
  const { t } = useTranslation('landing');
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Helper function to safely get translations with type assertion
  const getTranslation = (key: string): string => {
    return t(key as any) as string;
  };

  const features: FeatureItem[] = [
    { 
      id: 'ai', 
      icon: <Zap className="h-5 w-5" />,
      titleKey: 'features.items.0.title',
      descriptionKey: 'features.items.0.description'
    },
    { 
      id: 'security', 
      icon: <Shield className="h-5 w-5" />,
      titleKey: 'features.items.1.title',
      descriptionKey: 'features.items.1.description'
    },
    { 
      id: 'collaboration', 
      icon: <GitBranch className="h-5 w-5" />,
      titleKey: 'features.items.2.title',
      descriptionKey: 'features.items.2.description'
    },
    { 
      id: 'performance', 
      icon: <Rocket className="h-5 w-5" />,
      titleKey: 'features.items.3.title',
      descriptionKey: 'features.items.3.description'
    },
  ];

  return (
    <motion.div
      className={cn('mt-6 md:mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.08 }}
    >
      {features.map((feature) => (
        <motion.div
          key={feature.id}
          className="group relative overflow-hidden rounded-lg border border-gray-700/70 bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-4 backdrop-blur-sm transition-all hover:border-cyan-400/25 hover:shadow-md hover:shadow-cyan-500/10"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: animationDuration,
                ease: 'easeOut',
              },
            },
          }}
          whileHover={prefersReducedMotion ? undefined : { y: -2, transition: { duration: 0.18 } }}
        >
          {/* Glasmorphism Highlight Effect */}
          <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-r from-cyan-400/8 via-transparent to-teal-400/8 opacity-0 blur-sm transition duration-300 group-hover:opacity-100" />
          
          <div className="relative">
            <motion.div 
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/12 to-teal-500/12 text-cyan-300"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.06, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 280 }}
            >
              {feature.icon}
            </motion.div>
            
            <h3 className="mb-2 text-sm font-semibold text-gray-100">
              {getTranslation(feature.titleKey)}
            </h3>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              {getTranslation(feature.descriptionKey)}
            </p>
          </div>
          
          {/* Corner decoration */}
          {!prefersReducedMotion && (
            <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500/10 to-teal-500/10 opacity-0 blur-md transition-all duration-500 group-hover:opacity-100" />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default HeroFeatures;
