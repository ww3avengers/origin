import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type LogoKey = 'sap' | 'microsoft' | 'googleCloud' | 'openai' | 'grok';

interface Logo {
  key: LogoKey;
  src: string; // resolved with BASE_URL
  rawSrc: string; // root-relative fallback (/assets/...)
  altKey: `hero.logos.${LogoKey}`;
  width: number;
  height: number;
}

interface HeroLogosProps {
  className?: string;
}

export const HeroLogos = ({ className }: HeroLogosProps) => {
  const { t } = useTranslation('landing');
  const prefersReducedMotion = useReducedMotion() ?? false;
  
  // Helper function to safely get translations with type assertion
  const getTranslation = (key: string, defaultValue?: string): string => {
    return (t(key as any, { defaultValue }) as unknown) as string;
  };

  // Robust asset resolution respecting Vite's base path
  const resolveAsset = (relativePath: string): string => {
    const base = (import.meta as any).env?.BASE_URL ?? '/';
    const baseClean = String(base).replace(/\/$/, '');
    const relClean = String(relativePath).replace(/^\//, '');
    return `${baseClean}/${relClean}`;
  };

  const rootAsset = (relativePath: string): string => {
    const relClean = String(relativePath).replace(/^\//, '');
    return `/${relClean}`;
  };

  // Statische Logos mit optimierten Werten
  const logos: readonly Logo[] = [
    { 
      key: 'sap',
      src: resolveAsset('assets/sap.svg'),
      rawSrc: rootAsset('assets/sap.svg'), 
      altKey: 'hero.logos.sap',
      width: 100,
      height: 40
    },
    { 
      key: 'microsoft',
      src: resolveAsset('assets/microsoft.svg'),
      rawSrc: rootAsset('assets/microsoft.svg'), 
      altKey: 'hero.logos.microsoft',
      width: 140,
      height: 30
    },
    { 
      key: 'googleCloud',
      src: resolveAsset('assets/google-cloud.svg'),
      rawSrc: rootAsset('assets/google-cloud.svg'), 
      altKey: 'hero.logos.googleCloud',
      width: 140,
      height: 30
    },
    {
      key: 'openai',
      src: resolveAsset('assets/openai.svg'),
      rawSrc: rootAsset('assets/openai.svg'),
      altKey: 'hero.logos.openai',
      width: 120,
      height: 30,
    },
    {
      key: 'grok',
      src: resolveAsset('assets/grok.svg'),
      rawSrc: rootAsset('assets/grok.svg'),
      altKey: 'hero.logos.grok',
      width: 120,
      height: 30,
    },
  ] as const;

  // Fallback Alt-Texte pro Logo (falls i18n-Keys fehlen)
  const altFallbacks: Record<LogoKey, string> = {
    sap: 'SAP Logo',
    microsoft: 'Microsoft Logo',
    googleCloud: 'Google Cloud Logo',
    openai: 'OpenAI Logo',
    grok: 'Grok (xAI) Logo',
  };

  return (
    <section className={cn('w-full py-10 md:py-12 overflow-hidden', className)}>
      <h2 className="sr-only">Unsere Kunden</h2>
      <motion.p 
        className="text-center text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6 md:mb-8"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
      >
        {getTranslation('hero.trustedBy', 'Vertrauen Sie den Besten')}
      </motion.p>
      
      {/* Modernes Laufband mit automatischer Animation */}
      <div className="relative w-full max-w-full mx-auto">
        {/* Subtiler Gradient-Overlay für die Ränder */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-900/90 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-900/90 to-transparent z-10" />
        
        <motion.div 
          className="flex items-center gap-12 md:gap-16 py-4"
          animate={prefersReducedMotion ? undefined : { x: ["0%", "-60%"] }}
          transition={prefersReducedMotion ? undefined : { duration: 30, ease: "linear", repeat: Infinity, repeatType: "loop" }}
        >
          {/* Verdoppelte Logos für nahtloses Scrollen */}
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <motion.figure
              key={`${logo.key}-${index}`}
              className="relative h-8 w-auto grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100"
              whileHover={prefersReducedMotion ? undefined : { y: -1.5, scale: 1.03 }}
            >
              <img
                src={logo.src}
                alt={getTranslation(logo.altKey, altFallbacks[logo.key])}
                width={logo.width}
                height={logo.height}
                className="h-full w-auto object-contain"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement & { dataset: DOMStringMap };
                  if (img.dataset.fallbackApplied !== '1') {
                    img.dataset.fallbackApplied = '1';
                    // Fallback auf Root-Pfad
                    img.src = logo.rawSrc;
                    // Optionales Logging zur Diagnose
                    if (typeof window !== 'undefined' && 'console' in window) {
                      // eslint-disable-next-line no-console
                      console.warn('[HeroLogos] Fallback to root asset for', logo.key, '->', logo.rawSrc);
                    }
                  }
                }}
              />
              <span className="sr-only">{getTranslation(logo.altKey, altFallbacks[logo.key])}</span>
              
              {/* Subtiler Glow-Effekt beim Hover */}
              <motion.div 
                className="absolute inset-0 -z-10 bg-blue-500/0 blur-md rounded-full"
                initial={false}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              />
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroLogos;
