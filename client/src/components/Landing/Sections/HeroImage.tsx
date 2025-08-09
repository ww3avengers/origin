import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeroImageProps {
  className?: string;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}

export const HeroImage = ({ className, scrollYProgress }: HeroImageProps) => {
  const { t } = useTranslation(['translation', 'landing']);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <motion.div
      className={cn('relative w-full h-full', className)}
      style={prefersReducedMotion ? undefined : { y, scale }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <Image
          src="/images/hero-dashboard.png"
          alt={t('landing.hero.image_alt' as any, {
            defaultValue: 'SIGMACODE AI Dashboard Vorschau'
          }) as unknown as string}
          width={1200}
          height={800}
          priority
          className="w-full h-auto object-cover opacity-90"
        />
      </div>
    </motion.div>
  );
};

export default HeroImage;
