import { FC, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { useAnimationPerformance, useOptimizeAnimations } from '@/hooks/useAnimationPerformance';
import { cn } from '@/lib/utils';
import { HeroContent } from './HeroContent';

// Generate random particles for the background
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `particle-${i}`,
    size: Math.random() * 3 + 1,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.1,
  }));
};


interface HeroSectionProps {
  className?: string;
}

export const HeroSection: FC<HeroSectionProps> = ({ className }) => {
  // Only use the 'landing' namespace as it's the only one we need
  const { t } = useTranslation('landing');
  
  // Helper function to safely get translations with type assertion
  const getTranslation = (key: string): string => {
    return t(key as any) as string;
  };
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Performance monitoring and optimization
  // Initialize animation performance monitoring (no assignment needed)
  useAnimationPerformance(process.env.NODE_ENV === 'development');
  useOptimizeAnimations();
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Memoize particles to avoid remounts on re-render (reduced count for calm background)
  const particles = useMemo(() => generateParticles(6), []);



  const handlePrimaryClick = useCallback(() => {
    // Handle primary CTA click (e.g., open signup modal)
    console.log('Primary CTA clicked');
  }, []);

  const handleSecondaryClick = useCallback(() => {
    // Handle secondary CTA click (e.g., scroll to features)
    console.log('Secondary CTA clicked');
  }, []);

  return (
    <section
      ref={targetRef}
      className={cn(
        'relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        'py-16 md:py-24',
        className
      )}
      aria-label={getTranslation('hero.title')}
    >
      {/* Moderner Blur-Licht Hintergrund */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Subtiler Farbverlauf mit Blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 via-gray-900 to-gray-800/90" />
        
        {/* Weiche Lichtpunkte mit Animation in blau/cyan Tönen */}
        <div className="absolute -left-[15%] -top-[15%] w-[60%] h-[60%] bg-blue-400/5 rounded-full mix-blend-soft-light filter blur-[100px] animate-float-slow" />
        <div className="absolute -right-[10%] -bottom-[10%] w-[50%] h-[50%] bg-cyan-400/5 rounded-full mix-blend-soft-light filter blur-[120px] animate-float-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/3 rounded-full mix-blend-soft-light filter blur-[150px] animate-pulse-slow" />

        {/* Subtile Partikel mit dezenter Animation */}
        {!prefersReducedMotion && particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/5"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity * 0.5,
            }}
            animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
            transition={{
              duration: particle.duration * 1.8,
              delay: particle.delay,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}

         {/* Removed red scan line for a cleaner, unified aesthetic */}
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <HeroContent
            onPrimaryClick={handlePrimaryClick}
            onSecondaryClick={handleSecondaryClick}
            className="w-full text-center"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
