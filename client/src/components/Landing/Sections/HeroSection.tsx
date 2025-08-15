import { FC, useRef, useCallback, useState, useEffect, useId } from 'react';
import { useT } from '~/utils/i18n';
import { useAnimationPerformance, useOptimizeAnimations } from '@/hooks/useAnimationPerformance';
import { cn } from '@/lib/utils';
import { HeroContent } from './HeroContent';
import { Container } from '~/components/ui';
import { Section } from '~/components/ui/Section';
import RequestDemoDialog from '@/components/Landing/Dialogs/RequestDemoDialog';
import { track } from '@/lib/analytics/track';
import { getVariantForKey } from '@/lib/ab/variant';

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: FC<HeroSectionProps> = ({ className }) => {
  const t = useT();
  const targetRef = useRef<HTMLDivElement>(null);
  const [openDemo, setOpenDemo] = useState(false);
  const variant = getVariantForKey('hero', 'base');
  const headingId = useId();
  const [vhPx, setVhPx] = useState<number | null>(null);
  const [smallViewport, setSmallViewport] = useState<boolean>(false); // < md

  // Context for analytics events (locale, reduced motion, screen width)
  const getEventContext = useCallback(() => {
    if (typeof window === 'undefined') {
      return { locale: 'und', reduced_motion: false, screen_width: 0 };
    }
    const locale =
      (document && document.documentElement && document.documentElement.lang) ||
      (navigator && (navigator as any).language) ||
      'und';
    const reduced = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const width = window.innerWidth || 0;
    return { locale, reduced_motion: reduced, screen_width: width };
  }, []);

  // Performance monitoring and optimization
  // Initialize animation performance monitoring (no assignment needed)
  useAnimationPerformance(process.env.NODE_ENV === 'development');
  useOptimizeAnimations();
  // Decorative background permanently removed for cleaner layout

  // State-of-the-art Mobile-Viewport-Höhe via visualViewport (Fallback: innerHeight)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkSmall = () => setSmallViewport(window.innerWidth < 768); // < md
    checkSmall();
    const calcVh = () => {
      const vv = (window as any).visualViewport;
      const h = Math.round(vv?.height ?? window.innerHeight);
      setVhPx(h);
    };
    calcVh();
    window.addEventListener('resize', () => {
      checkSmall();
      calcVh();
    });
    window.addEventListener('orientationchange', () => {
      checkSmall();
      calcVh();
    });
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    vv?.addEventListener('resize', () => {
      checkSmall();
      calcVh();
    });
    return () => {
      // Best-effort cleanup; listeners were anonymous wrappers
      window.removeEventListener('resize', () => {});
      window.removeEventListener('orientationchange', () => {});
      vv?.removeEventListener('resize', () => {});
    };
  }, []);

  const handlePrimaryClick = useCallback(() => {
    // Track Primary CTA
    track({
      name: 'hero_cta_primary_click',
      props: { to: 'request_demo', variant, ...getEventContext() },
    });
    // Öffne Enterprise Demo-Modal; Fallback bleibt durch separate Kontakt-Sektion/Route bestehen
    setOpenDemo(true);
  }, [variant, getEventContext]);

  const handleSecondaryClick = useCallback(() => {
    // Track Secondary CTA
    track({
      name: 'hero_cta_secondary_click',
      props: { to: 'https://docs.sigmacode.ai', variant, ...getEventContext() },
    });
    // Vereinheitlichter Doku-Link
    window.open('https://docs.sigmacode.ai', '_blank', 'noopener,noreferrer');
  }, [variant, getEventContext]);

  // Impression tracking when Hero becomes visible (once)
  useEffect(() => {
    const node = targetRef.current;
    if (!node || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined')
      return;
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!fired && e.isIntersecting && e.intersectionRatio >= 0.5) {
            fired = true;
            track({ name: 'hero_impression', props: { variant, ...getEventContext() } });
            io.disconnect();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [variant, getEventContext]);

  return (
    <Section
      ref={targetRef as any}
      className={cn('bg-transparent px-0 py-0 sm:px-4 sm:py-0 overflow-visible', className)}
      data-section="hero"
      data-ai-title={t('landing.hero.title')}
      aria-labelledby={headingId}
      padding="none"
      divider="none"
    >
      <div
        className="w-full"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingTop: 'calc(env(safe-area-inset-top) + 32px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0px)',
          // Keine erzwungene Viewport-Höhe über Breakpoints hinweg
          contentVisibility: 'auto',
          containIntrinsicSize: '800px 600px',
        }}
      >
        <Container>
          <div className="mx-auto w-full max-w-[1280px] xl:max-w-[1360px] 2xl:max-w-[1440px] min-h-full flex flex-col items-center justify-start pb-0 sm:pb-5">
            <HeroContent
              onPrimaryClick={handlePrimaryClick}
              onSecondaryClick={handleSecondaryClick}
              className="w-full text-center"
              headingId={headingId}
            />
          </div>
        </Container>
      </div>

      {/* Request Demo Modal */}
      <RequestDemoDialog open={openDemo} onOpenChange={setOpenDemo} source="hero" />
    </Section>
  );
};

export default HeroSection;
