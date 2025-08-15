import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AnimatedTechPanelProps = {
  className?: string;
  /** Subtle color palette */
  colors?: {
    bg1: string; // e.g. '#0b1020'
    bg2: string; // e.g. '#121a33'
    accent: string; // e.g. 'rgba(99, 102, 241, 0.6)'
  };
  /** Number of moving orbs (2-6 empfohlen) */
  orbs?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Disable animation entirely (in addition to prefers-reduced-motion) */
  disabled?: boolean;
  /** Optional tagline rendered above the canvas in the brand title style */
  tagline?: string;
  /** Tagline animation mode */
  taglineMode?: 'static' | 'hover' | 'animated';
  /** Extra classes for the tagline element (e.g. sizing) */
  taglineClassName?: string;
};

/**
 * AnimatedTechPanel
 * - Dezente, performante Canvas-Animation mit Drift-Gradient und sanft bewegten Orbs
 * - SSR-sicher (Canvas nur clientseitig)
 * - Respektiert prefers-reduced-motion
 * - Keine externen Abhängigkeiten, reines Canvas
 */
const AnimatedTechPanel: React.FC<AnimatedTechPanelProps> = ({
  className,
  colors = {
    bg1: '#0b1020',
    bg2: '#121a33',
    accent: 'rgb(var(--rgb-brand-purple) / 0.5)', // brand purple with opacity
  },
  orbs = 4,
  speed = 1,
  disabled = false,
  tagline,
  taglineMode = 'animated',
  taglineClassName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = useReducedMotion() ?? false;
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; inside: boolean }>({ x: 0, y: 0, inside: false });
  const noisePatternRef = useRef<CanvasPattern | null>(null);
  const [isHovering, setIsHovering] = React.useState(false);

  useEffect(() => {
    if (disabled || prefersReduced) return; // Nichts animieren

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect?.width || 800));
      height = Math.max(1, Math.floor(rect?.height || 500));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    const resizeObs = new ResizeObserver(handleResize);
    if (canvas.parentElement) resizeObs.observe(canvas.parentElement);

    // Maus-Events für Parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.inside = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.inside = false;
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Noise Pattern vorbereiten (einmalig)
    if (!noisePatternRef.current) {
      const off = document.createElement('canvas');
      off.width = 64;
      off.height = 64;
      const octx = off.getContext('2d');
      if (octx) {
        const img = octx.createImageData(off.width, off.height);
        for (let i = 0; i < img.data.length; i += 4) {
          const v = 235 + Math.random() * 20; // sehr sanft
          img.data[i] = v;
          img.data[i + 1] = v;
          img.data[i + 2] = v;
          img.data[i + 3] = 12; // alpha niedrig
        }
        octx.putImageData(img, 0, 0);
        noisePatternRef.current = ctx.createPattern(off, 'repeat');
      }
    }

    // Orbs initialisieren
    const orbCount = Math.max(1, Math.min(6, orbs));
    const orbsState = Array.from({ length: orbCount }).map((_, i) => ({
      r: 60 + Math.random() * 100, // radius
      x: Math.random(),
      y: Math.random(),
      a: Math.random() * Math.PI * 2, // angle
      av: (0.2 + Math.random() * 0.4) * 0.001 * speed, // angular velocity
      hueShift: (i / orbCount) * 60,
      alpha: 0.08 + Math.random() * 0.08,
    }));

    let t = 0;
    let lastTs = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(32, now - lastTs); // clamp
      lastTs = now;
      t += dt * 0.0004 * speed; // global time

      // Parallax-Offset abhängig von Mausposition
      const mx = mouseRef.current.inside ? mouseRef.current.x / width - 0.5 : 0;
      const my = mouseRef.current.inside ? mouseRef.current.y / height - 0.5 : 0;
      const px = mx * 10; // max ~10px offset
      const py = my * 10;

      // Hintergrund: weicher verlaufender Gradient
      const g = ctx.createLinearGradient(0, 0, width, height);
      const drift = Math.sin(t * 0.8) * 0.05 + 0.05; // 0..0.1
      g.addColorStop(0, colors.bg1);
      g.addColorStop(1, colors.bg2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // Subtiles Grid
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#FFFFFF';
      const grid = 28;
      for (let x = 0; x <= width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x + Math.sin(x * 0.01 + t) * 2 + px * 0.5, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.cos(y * 0.01 + t) * 2 + py * 0.5);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Orbs
      for (const o of orbsState) {
        o.a += o.av * dt;
        const cx = (0.5 + (Math.cos(o.a) * 0.25 + (o.x - 0.5) * 0.2)) * width + px;
        const cy = (0.5 + (Math.sin(o.a * 0.9) * 0.22 + (o.y - 0.5) * 0.2)) * height + py;

        const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
        radial.addColorStop(0, colors.accent);
        radial.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = o.alpha + drift * 0.2;
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

      // Verbindungslinien zwischen nahen Orbs (sehr dezent)
      ctx.save();
      ctx.strokeStyle = colors.accent;
      for (let i = 0; i < orbsState.length; i++) {
        for (let j = i + 1; j < orbsState.length; j++) {
          const oi = orbsState[i];
          const oj = orbsState[j];
          const ix = (0.5 + (Math.cos(oi.a) * 0.25 + (oi.x - 0.5) * 0.2)) * width + px;
          const iy = (0.5 + (Math.sin(oi.a * 0.9) * 0.22 + (oi.y - 0.5) * 0.2)) * height + py;
          const jx = (0.5 + (Math.cos(oj.a) * 0.25 + (oj.x - 0.5) * 0.2)) * width + px;
          const jy = (0.5 + (Math.sin(oj.a * 0.9) * 0.22 + (oj.y - 0.5) * 0.2)) * height + py;
          const dx = jx - ix;
          const dy = jy - iy;
          const d = Math.hypot(dx, dy);
          const thresh = 220;
          if (d < thresh) {
            const a = (1 - d / thresh) * 0.25; // max alpha 0.25
            ctx.globalAlpha = a;
            ctx.beginPath();
            ctx.moveTo(ix, iy);
            ctx.lineTo(jx, jy);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Noise/Grain Overlay
      if (noisePatternRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = noisePatternRef.current as any;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    // Page Visibility -> Pause bei Inaktivität
    const handleVisibility = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!document.hidden && !rafRef.current) {
        lastTs = performance.now();
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      resizeObs.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [colors, orbs, speed, disabled, prefersReduced]);

  // Falls reduziert, zeige nur dezente statische Fläche
  // Optional: Tagline im Titel-Stil überlagert
  const computedTaglineClasses = (() => {
    if (!tagline) return '';
    // Kein statischer Gradient mehr; nur optionale zusätzliche Klassen vom Aufrufer
    return cn(taglineClassName);
  })();

  // Wave shimmer settings (aligned with AnimatedBrandTitle)
  const gradSizeWave = '320% 110%';
  const waveBand = [
    'linear-gradient(90deg,' +
      ' transparent 0%,' +
      ' rgba(30,136,229,0.00) 45.5%,' +
      ' rgba(30,136,229,0.18) 48.6%,' +
      ' rgba(102,197,255,0.55) 49.4%,' +
      ' rgba(120,205,255,0.75) 50%,' +
      ' rgba(102,197,255,0.55) 50.6%,' +
      ' rgba(30,136,229,0.18) 51.4%,' +
      ' rgba(30,136,229,0.00) 54.5%,' +
      ' transparent 100%)',
  ].join(', ');
  const waveActive =
    !prefersReduced &&
    !disabled &&
    (taglineMode === 'animated' || (taglineMode === 'hover' && isHovering));
  const loopDuration = 30.2;

  return (
    <div
      className={cn('relative', className)}
      aria-hidden={tagline ? undefined : true}
      aria-label={tagline ? tagline : undefined}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {tagline && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <span
            className={cn(
              // Default Größe: fein, skalierbar; kann via taglineClassName überschrieben werden
              'relative text-[clamp(0.95rem,1.8vw,1.15rem)] font-semibold text-white drop-shadow-sm',
              computedTaglineClasses,
            )}
          >
            {/* Base pure-white text */}
            <span className="relative z-[1]">{tagline}</span>

            {/* Initial sweep overlay (from right to left), very subtle */}
            {!prefersReduced && !disabled && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[2] bg-clip-text text-transparent"
                style={{
                  background: waveBand,
                  WebkitBackgroundClip: 'text' as any,
                  backgroundSize: gradSizeWave,
                  opacity: 0.18, // dezenter als Titel
                }}
                initial={{ backgroundPosition: '100% 0%', opacity: 0 }}
                animate={
                  waveActive
                    ? {
                        backgroundPosition: ['100% 0%', '0% 0%'],
                        opacity: [0, 0.18, 0],
                        transition: { duration: 2.0, ease: 'linear' },
                      }
                    : {}
                }
              >
                {tagline}
              </motion.span>
            )}

            {/* Continuous loop overlay (left -> right), only when active */}
            {waveActive && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[2] bg-clip-text text-transparent"
                style={{
                  background: waveBand,
                  WebkitBackgroundClip: 'text' as any,
                  backgroundSize: gradSizeWave,
                  opacity: 0.14,
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 0%'],
                  transition: { duration: loopDuration, ease: 'linear', repeat: Infinity },
                }}
              >
                {tagline}
              </motion.span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimatedTechPanel;
