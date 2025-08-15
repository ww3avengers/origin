import { FC, useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, easeOut } from 'framer-motion';
import { useT } from '~/utils/i18n';
import { TranslationKeys } from '~/hooks';
import { z } from 'zod';
import { GitBranch, Plug, UserCheck } from 'lucide-react';
import HeroActions from './HeroActions';
import { IN_VIEW_ONCE } from './LandingSection';
import PromoBadge from '~/components/ui/PromoBadge';
import AgentVisualDemo from '../AgentDemo/AgentVisualDemo';
import { Container } from '~/components/ui';
import { Section } from '~/components/ui/Section';

// Define the type for our features
interface FeatureItem {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

// Hinweis: Alle i18n-Keys sind vollqualifiziert als 'landing.*'.
// Zod-Validierung für Features aus den Locales
const FeatureItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});
const FeaturesSchema = z.array(FeatureItemSchema);

interface AgentHeroSectionProps {
  onLearnMore: () => void;
}

const AgentHeroSection: FC<AgentHeroSectionProps> = ({ onLearnMore }) => {
  const t = useT();
  const prefersReducedMotion = useReducedMotion() ?? false;
  // Guard: deactivate heavy gradient overlays on very small screens
  const [smallViewport, setSmallViewport] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setSmallViewport(window.innerWidth < 640); // < sm
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const enableOverlays = false;
  const headingId = useId();
  const subtitleId = useId();
  const rightRef = useRef<HTMLDivElement | null>(null);

  // Scroll-basiertes Parallax für rechte Spalte – sehr feine Amplituden
  const { scrollYProgress } = useScroll({ target: rightRef, offset: ['start end', 'end start'] });
  const yFar = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 12]);
  const yMid = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -18]);
  const yNear = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 10]);
  const xNear = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -8]);

  // Get features from translations with returnObjects via useT hook (array of FeatureItem)
  const featuresRaw = t('landing:agents.hero.features', { returnObjects: true }) as unknown;
  const parsed = FeaturesSchema.safeParse(featuresRaw);
  const features: FeatureItem[] = parsed.success ? parsed.data : [];

  // Icons für die Features zuweisen
  const featuresWithIcons = features.map((feature, index) => {
    // Positionsbasiertes Mapping: 0=Workflows, 1=Tool-Integrationen, 2=Human-in-the-Loop
    const Icon = index === 0 ? GitBranch : index === 1 ? Plug : UserCheck;
    return {
      ...feature,
      icon: <Icon className="h-5 w-5" />,
    };
  });

  // Motion variants (achten auf Reduced Motion)
  const listVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.06, ease: easeOut },
        },
      };

  const itemVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: easeOut } },
      };

  const scrollToDemo = () => {
    const demoSection = document.getElementById('agent-demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Section
      className="relative overflow-visible bg-transparent text-white mt-[80px] py-0"
      role="region"
      aria-labelledby={headingId}
      aria-describedby={subtitleId}
      padding="none"
      divider="none"
      data-section="agent-hero"
      // Section-weite Accent-Variable (sky-300)
      style={{ ['--accent-ring' as any]: '147 197 253' }}
    >
      <Container>
        <div className="relative isolate grid grid-cols-1 items-start gap-2 md:gap-4 md:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 lg:[grid-template-columns:43%_57%] xl:gap-8 xl:[grid-template-columns:43%_57%] transition-all duration-300">
          {/* Linke Spalte: Copy & Actions */}
          <div className="mx-auto max-w-3xl rounded-2xl bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/10 backdrop-blur-xl dark:bg-black/30 md:p-8 lg:mx-0">
            <div className="pointer-events-auto relative z-20 mx-0 min-w-0 select-text text-left xl:max-w-none 2xl:max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
                className="mb-4 flex justify-start"
              >
                <PromoBadge
                  label={t('landing.agents.hero.badge', { defaultValue: 'Autonome KI‑Agenten' })}
                  icon={<GitBranch className="h-4 w-4" aria-hidden />}
                  size="sm"
                  tone="accent"
                  className="whitespace-nowrap accent-shimmer-soft focusable-accent"
                  style={{ ['--accent-ring' as any]: '147 197 253' }}
                />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
                transition={{ duration: 0.44, ease: 'easeOut', delay: 0.08 }}
                className="text-[clamp(1.65rem,2.8vw,2.9rem)] font-semibold leading-[1.06] tracking-[0.002em] text-white/90 xl:text-[clamp(1.8rem,2.6vw,3.2rem)]"
                style={{ textWrap: 'balance' } as React.CSSProperties}
                id={headingId}
              >
                {t('landing.agents.hero.title')}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.14 }}
                className="mt-3 max-w-[46rem] text-[clamp(0.95rem,1.2vw,1.1rem)] text-base leading-[1.58] sm:leading-[1.62] tracking-[0.001em] text-gray-300/90 sm:text-lg"
                style={{ textWrap: 'balance' } as React.CSSProperties}
                id={subtitleId}
              >
                {t('landing.agents.hero.subtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.22 }}
                className="mt-5 flex justify-start gap-2 sm:mt-6"
              >
                <HeroActions onPrimaryClick={onLearnMore} onSecondaryClick={scrollToDemo} mobileInline compact size="sm" className="justify-start gap-2 px-2 sm:px-0" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.28 }}
                className="mt-6 text-left sm:mt-8"
              >
                <motion.ul
                  role="list"
                  className="grid gap-1"
                  variants={listVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ ...IN_VIEW_ONCE, amount: 0.5 }}
                >
                  {featuresWithIcons.map((feature, index) => (
                    <motion.li
                      key={index}
                      role="listitem"
                      className="group relative -mx-2.5 flex items-start gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-white/5"
                      variants={itemVariants}
                    >
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-inset ring-white/15 transition-colors group-hover:bg-white/15">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-[14px] font-medium leading-tight text-white/95">
                          {feature.title}
                        </h3>
                        <p className="max-w-[46rem] text-[12.5px] leading-[1.45] text-gray-300/80">
                          {feature.description}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            </div>
          </div>

          {/* Rechte Spalte: Demo/Animation (auf Spaltenbreite begrenzt) */}
          <div
            ref={rightRef}
            className="pointer-events-none relative z-10 mx-0 flex w-full min-w-0 max-w-full items-center justify-center overflow-visible transition-all duration-300"
          >
            {/* Parallax Depth Layers (far/mid/near) – deaktiviert bei Reduced Motion oder sehr kleinem Viewport */}
            {enableOverlays && (
              <>
                <motion.div
                  aria-hidden
                  className="absolute inset-0 z-0"
                  style={{
                    y: yFar,
                    background:
                      'radial-gradient(60% 50% at 52% 50%, rgba(56,189,248,0.04) 0%, rgba(56,189,248,0.0) 100%)',
                    willChange: 'transform',
                  }}
                />
                <motion.div
                  aria-hidden
                  className="absolute inset-0 z-0"
                  style={{
                    y: yMid,
                    background:
                      'radial-gradient(42% 38% at 48% 46%, rgba(56,189,248,0.035) 0%, rgba(56,189,248,0.025) 55%, rgba(0,0,0,0.0) 100%)',
                    mixBlendMode: 'screen',
                    willChange: 'transform',
                  }}
                />
                <motion.div
                  aria-hidden
                  className="absolute inset-0 z-0"
                  style={{
                    x: xNear,
                    y: yNear,
                    background:
                      'radial-gradient(28% 24% at 46% 52%, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0.035) 60%, rgba(0,0,0,0.0) 100%)',
                    filter: 'blur(8px)',
                    mixBlendMode: 'screen',
                    willChange: 'transform',
                  }}
                />
              </>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ ...IN_VIEW_ONCE, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 flex w-full max-w-full translate-x-0 transform-gpu flex-col overflow-visible rounded-xl bg-transparent shadow-none sm:rounded-2xl transition-all duration-300"
              /* Maskierung entfernt, um harte Kanten zu vermeiden */
              role="region"
              aria-label={t('landing.agentDemo.intro')}
            >
              <div className="flex aspect-[4/3] sm:aspect-[16/10] h-full max-h-[92svh] sm:max-h-[84svh] min-h-[360px] w-full min-w-0 items-center justify-center overflow-visible p-0 sm:p-3 md:min-h-[460px] md:p-3 lg:aspect-[16/9] lg:min-h-[560px] lg:p-4 xl:min-h-[660px]">
                <AgentVisualDemo
                  isActive={true}
                  visualOnly
                  forceMotion
                  className="pointer-events-none w-full max-w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default AgentHeroSection;
