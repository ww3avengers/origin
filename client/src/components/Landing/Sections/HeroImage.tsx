import { motion, useScroll, useTransform, useReducedMotion, useSpring } from 'framer-motion';
import { useT } from '~/utils/i18n';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Konstant: Spring-Config außerhalb der Komponente, um Re-Instanziierung zu vermeiden
const SPRING_SMOOTH = { stiffness: 120, damping: 24, mass: 0.4 } as const;

interface HeroImageProps {
  className?: string;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}

export const HeroImage = ({ className, scrollYProgress }: HeroImageProps) => {
  const t = useT();
  const prefersReducedMotion = useReducedMotion() ?? false;
  // Raw transform values (kleine Amplituden, subtil) mit Clamp
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'], { clamp: true });
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 1.02], { clamp: true });
  // Sanft geglättete Werte via Spring (ruhig, ohne Bounce)
  const y = useSpring(rawY, SPRING_SMOOTH);
  const scale = useSpring(rawScale, SPRING_SMOOTH);

  return (
    <motion.div
      className={cn('relative h-full w-full transform-gpu will-change-transform', className)}
      style={prefersReducedMotion ? undefined : { y, scale }}
      data-testid="hero-image-motion"
      aria-label={
        prefersReducedMotion
          ? t('landing.hero.image_alt', { defaultValue: 'SIGMACODE AI Dashboard Vorschau' })
          : undefined
      }
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl bg-transparent ring-1 ring-inset ring-white/10"
        aria-hidden={false}
      >
        <Image
          src="/images/hero-dashboard.png"
          alt={t('landing.hero.image_alt')}
          width={1200}
          height={800}
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          className="h-auto w-full object-cover opacity-90"
        />
      </div>
    </motion.div>
  );
};

export default HeroImage;
