import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { IN_VIEW_ONCE } from './LandingSection';
import { useT } from '~/utils/i18n';
import { GitBranch, Bot, Users } from 'lucide-react';

type FeatureKey = 'workflows' | 'agents' | 'teams';

interface FeatureItem {
  id: FeatureKey;
  icon: React.ReactNode;
  text: string;
}

interface HeroFeaturesProps {
  className?: string;
  animationDuration?: number;
}

export const HeroFeatures = ({ className, animationDuration = 0.5 }: HeroFeaturesProps) => {
  const t = useT();
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Pull USPs from landing.hero.usps (array of strings) with safe fallbacks
  const usps = (t('landing.hero.usps', { returnObjects: true }) as unknown as string[]) || [];
  const [
    usp0 = 'Build repeatable AI workflows',
    usp1 = 'Deploy specialized AI agents',
    usp2 = 'Orchestrate MAS teams for complex tasks',
  ] = usps;

  const features: FeatureItem[] = [
    { id: 'workflows', icon: <GitBranch className="h-5 w-5" />, text: usp0 },
    { id: 'agents', icon: <Bot className="h-5 w-5" />, text: usp1 },
    { id: 'teams', icon: <Users className="h-5 w-5" />, text: usp2 },
  ];

  return (
    <motion.div
      className={cn('mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:mt-8', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
      transition={{ staggerChildren: 0.08 }}
    >
      {features.map((feature) => (
        <motion.div
          key={feature.id}
          className="group relative overflow-hidden rounded-lg bg-transparent p-4 ring-1 ring-inset ring-white/10 transition-all hover:shadow-md"
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
          {/* Neutral highlight removed: no gradient/blur */}
          <div className="absolute -inset-[1px] rounded-lg opacity-0 transition duration-300 group-hover:opacity-100" />

          <div className="relative">
            <motion.div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-inset ring-white/15"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.06, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 280 }}
            >
              {feature.icon}
            </motion.div>

            <h3 className="text-sm font-semibold leading-snug text-gray-100">{feature.text}</h3>
          </div>

          {/* Corner decoration removed for neutrality and performance */}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default HeroFeatures;
