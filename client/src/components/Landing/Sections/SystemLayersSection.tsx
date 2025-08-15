import { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
// i18n Hook aus App-Utility verwenden
import { useT } from '~/utils/i18n';
import { useReducedMotion, useInView, motion } from 'framer-motion';
import LandingSection from './LandingSection';
import { SectionHeader } from '@/components/ui/typography/SectionHeader';
import { getVariantForKey, type Variant } from '@/lib/ab/variant';
import { track } from '@/lib/analytics/track';
import SystemLayersVisual from '@/components/Landing/SystemLayersVisual';
// Unused subsection imports entfernt
// Slider entfernt – statisches Grid statt Carousel

// Ehemalige animierte "LayeredSystemFlow"-Komponente entfernt

// Kleine Child-Komponente für die Visualisierung mit eigenen Hooks (beachtet Rules of Hooks)
const SystemLayersCanvas: FC<{
  ariaLabel: string;
  layerNames: [string, string, string];
  labelMode: 'arc' | 'column' | 'arc-vertical' | 'right-column';
  arcSide: 'top' | 'bottom';
  labelSize: number;
  intensity: 'low' | 'medium' | 'high';
  onFirstImpression?: (info: { width: number; intensity: string; variant: string }) => void;
  variant: string;
}> = ({ ariaLabel, layerNames, labelMode, arcSide, labelSize, intensity, onFirstImpression, variant }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { margin: '-20% 0px -20% 0px', amount: 0.2 });
  const prefersReduced = useReducedMotion() ?? false;
  const [winW, setWinW] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [vhPx, setVhPx] = useState<number | null>(null);
  const [box, setBox] = useState<{ w: number; h: number }>(() => {
    if (typeof window === 'undefined') return { w: 720, h: 360 };
    return { w: Math.max(320, Math.min(window.innerWidth, 1920)), h: Math.max(240, Math.min(window.innerHeight, 1080)) };
  });
  const roDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const calcVh = () => {
      const vv = (window as any).visualViewport;
      const h = Math.round((vv?.height ?? window.innerHeight));
      setVhPx(h);
      setWinW(window.innerWidth);
    };
    calcVh();
    window.addEventListener('resize', calcVh);
    window.addEventListener('orientationchange', calcVh);
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    vv?.addEventListener('resize', calcVh);
    return () => {
      window.removeEventListener('resize', calcVh);
      window.removeEventListener('orientationchange', calcVh);
      vv?.removeEventListener('resize', calcVh);
    };
  }, []);

  // Observe container size to pass exact width/height into SVG, avoiding letterboxing/clipping
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const run = () => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          if (cr.width > 0 && cr.height > 0) {
            setBox({ w: Math.round(cr.width), h: Math.round(cr.height) });
          }
        }
      };
      if (roDebounceRef.current) window.clearTimeout(roDebounceRef.current);
      roDebounceRef.current = window.setTimeout(run, 80);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Impression Tracking: einmal pro Session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const KEY = 'systemLayers:seen';
    if (inView) {
      try {
        const seen = window.sessionStorage.getItem(KEY);
        if (!seen) {
          window.sessionStorage.setItem(KEY, '1');
          onFirstImpression?.({ width: winW, intensity, variant });
        }
      } catch {
        // ignore storage issues
      }
    }
  }, [inView, intensity, variant, winW, onFirstImpression]);

  // Dynamische Intensität auf Basis von Motion/Ecology
  const effectiveIntensity = useMemo<'low' | 'medium' | 'high'>(() => {
    if (prefersReduced) return 'low';
    if (winW < 768) return intensity === 'high' ? 'medium' : intensity; // leichte Drossel auf Mobile
    return intensity;
  }, [prefersReduced, winW, intensity]);

  // Mobile-Optimierung: geringere Labelgröße und engerer Arc-Offset
  const isMobile = winW < 640;
  const effectiveLabelSize = isMobile ? Math.max(10, labelSize - 2) : labelSize;
  const effectiveArcOffsetPx = isMobile ? 14 : 18;

  return (
    <motion.div
      ref={containerRef}
      className="relative mx-auto w-full h-auto aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/7] lg:aspect-[21/9] max-h-none sm:max-h-[min(85svh,640px)] transition-[height,width,padding] duration-300 ease-out"
      style={{
        paddingLeft: 'calc(env(safe-area-inset-left) + 8px)',
        paddingRight: 'calc(env(safe-area-inset-right) + 8px)',
        paddingTop: 'calc(env(safe-area-inset-top) + 0px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 0px)',
        height: undefined,
        contentVisibility: 'auto',
        containIntrinsicSize: '800px 600px',
      }}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.2, once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0">
        <SystemLayersVisual
          className="w-full h-full"
          width={box.w}
          height={box.h}
          ariaLabel={ariaLabel}
          layerNames={layerNames}
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          labelMode={labelMode}
          arcSide={arcSide}
          arcOffsetDeg={90}
          labelArcOffsetPx={effectiveArcOffsetPx}
          labelSize={effectiveLabelSize}
          labelWeight={400}
          labelColor="rgba(230,232,238,0.9)"
          active={!!inView}
          intensity={effectiveIntensity}
        />
      </div>
    </motion.div>
  );
};

const SystemLayersSection: FC = memo(() => {
  // i18n: App-Hook und Helper: Behandle Rückgaben wie 'system.title' als fehlend
  const tRaw = useT();
  const norm = (key: string, val: unknown) => {
    const s = String(val ?? '');
    if (!s || s === key || s === `landing:${key}`) return '';
    return s;
  };
  const lt = (k: string) => norm(k, tRaw(`landing:${k}` as any));
  const td = (k: string) => norm(k, tRaw(k as any));

  // Entfernte Karten-Daten (nicht genutzt)

  // Ehemalige Framer Variants für Karten entfernt

  const titleText = lt('system.title') || 'From idea to results – in three layers';
  const subtitleText =
    lt('system.subtitle') ||
    'One platform, three layers: Business AI, agent workflows, multi-agent coordination.';
  const descText = lt('system.description');

  // A/B-Variant bestimmen und Visual-Parameter daraus ableiten
  const systemVariant = useMemo<Variant>(() => getVariantForKey('systemLayers', 'base'), []);
  const visualProps = useMemo(() => {
    switch (systemVariant) {
      case 'alt':
        return { labelMode: 'arc-vertical' as const, arcSide: 'top' as const, labelSize: 13, intensity: 'low' as const };
      case 'base':
      default:
        return { labelMode: 'arc' as const, arcSide: 'bottom' as const, labelSize: 12, intensity: 'medium' as const };
    }
  }, [systemVariant]);

  

  return (
    <LandingSection
      id="system-layers"
      ariaLabel={lt('system.title') || 'System layers'}
      className="relative overflow-hidden bg-transparent px-0 py-0 sm:px-4 sm:py-10 [&>div[aria-hidden]]:hidden"
      padding="lg"
      bleed={false}
      divider="none"
      style={{ position: 'relative', zIndex: 100 }}
      dataSection="system-layers"
      data-ai-section="system-layers"
      accentTopGlow
      containerClassName="relative mx-auto max-w-none sm:max-w-7xl"
    >
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Linke Spalte: Titel/Copy analog Agent-Hero-Section */}
        <motion.div
          className="block"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.25, once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative z-50 mb-6 sm:mb-8 text-left">
            <SectionHeader
              align="left"
              size="h2"
              title={titleText}
              subtitle={subtitleText}
              className="max-w-2xl"
            />
            {descText ? (
              <p className="mt-2 sm:mt-3 max-w-xl text-base text-slate-300">
                {descText}
              </p>
            ) : null}
          </div>
        </motion.div>

        {/* Rechte Spalte: Visual */}
        <div className="relative lg:col-span-2">
          <div className="relative mb-0 mt-2 sm:mt-6 md:mt-8 lg:mt-10">
            <SystemLayersCanvas
              ariaLabel={lt('system.aria') || td('system.aria') || 'System layers visualization'}
              layerNames={[
                lt('system.layers.business.short') || td('system.layers.business.short') || 'Business',
                lt('system.layers.agents.short') || td('system.layers.agents.short') || 'Agents',
                lt('system.layers.mas.short') || td('system.layers.mas.short') || 'Multi‑Agent',
              ]}
              labelMode={visualProps.labelMode}
              arcSide={visualProps.arcSide}
              labelSize={visualProps.labelSize}
              intensity={visualProps.intensity}
              variant={systemVariant}
              onFirstImpression={({ width, intensity, variant }) => {
                const widthBucket = width < 768 ? 'sm' : width < 1280 ? 'md' : 'lg';
                track({ name: 'systemLayers_impression', props: { widthBucket, intensity, variant } });
              }}
            />
          </div>
        </div>
      </div>

      {/* Karten wurden entfernt */}
    </LandingSection>
  );
});

export default SystemLayersSection;
