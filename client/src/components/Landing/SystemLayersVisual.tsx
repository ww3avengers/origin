import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '~/utils/i18n';

export type LayerItem = {
  id: string;
  label?: string;
  color?: string;
  toLayer: 1 | 2 | 3; // target ring index (inner=1..outer=3)
  delay?: number;
  emoji?: string; // lightweight icon fallback
  size?: number; // px radius of badge
};

export type SystemLayersVisualProps = {
  className?: string;
  width?: number;
  height?: number;
  ringColors?: [string, string, string];
  items?: LayerItem[];
  orbitSpeed?: number; // degrees per second
  layerNames?: [string, string, string]; // custom labels
  fontFamily?: string; // typography control
  labelMode?: 'arc' | 'column' | 'arc-vertical' | 'right-column';
  labelSize?: number;
  labelWeight?: number;
  labelColor?: string;
  arcSide?: 'top' | 'bottom';
  arcOffsetDeg?: number; // positive: clockwise shift of arc
  labelArcOffsetPx?: number; // positive: place labels slightly outside the ring
  ariaLabel?: string; // a11y: localized label for the visualization
  /** Ob Animationen aktiv sein sollen (Viewport-gesteuert) */
  active?: boolean;
  /** Visuelle Intensität (Sparkles/Orbits) */
  intensity?: 'low' | 'medium' | 'high';
  /** Optionales Test-ID-Attribut für stabilere Tests */
  testId?: string;
};

const defaultItems: LayerItem[] = [
  { id: 'agent-1', toLayer: 1, color: '#22d3ee', delay: 0.05, emoji: '🤖', size: 10 },
  { id: 'agent-2', toLayer: 1, color: '#60a5fa', delay: 0.25, emoji: '🧠', size: 10 },
  { id: 'tool-1', toLayer: 2, color: '#34d399', delay: 0.35, emoji: '🛠️', size: 10 },
  { id: 'tool-2', toLayer: 2, color: '#60a5fa', delay: 0.55, emoji: '⚙️', size: 10 },
  { id: 'svc-1', toLayer: 3, color: '#f59e0b', delay: 0.75, emoji: '☁️', size: 10 },
  { id: 'svc-2', toLayer: 3, color: '#f472b6', delay: 0.95, emoji: '🔗', size: 10 },
];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
}

export const SystemLayersVisual: React.FC<SystemLayersVisualProps> = ({
  className,
  width = 720,
  height = 360,
  ringColors = ['#4f46e5', '#059669', '#60a5fa'],
  items = defaultItems,
  orbitSpeed = 24,
  layerNames,
  fontFamily = "ui-sans-serif, system-ui, -apple-system, 'SF Pro Display', 'Inter', 'Helvetica Neue', Arial",
  labelMode = 'arc',
  labelSize = 13,
  labelWeight = 600,
  labelColor = '#e5e7eb',
  arcSide = 'top',
  arcOffsetDeg = 0,
  labelArcOffsetPx = 0,
  ariaLabel,
  active = true,
  intensity = 'medium',
  testId,
}) => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;
  const cx = width / 2;
  const cy = height / 2;
  // radii for 3 rings — maximize usage without side clipping
  // Strategy: fit to container using 'meet' and set outer ring to half of min(width,height) minus a small margin
  const baseMin = Math.min(width, height);
  // safe margin to avoid touching edges on high-DPR phones; at least 8px or 2% of min side
  const margin = Math.max(8, Math.floor(baseMin * 0.02));
  const r3 = Math.max(10, baseMin / 2 - margin);
  // derive inner rings proportionally for balanced spacing
  const r2 = r3 * 0.74;
  const r1 = r3 * 0.47;
  const radii = [r1, r2, r3];

  // evenly distribute items per target ring
  const ringBuckets = useMemo(() => {
    const b: Record<1 | 2 | 3, LayerItem[]> = { 1: [], 2: [], 3: [] };
    for (const it of items) b[it.toLayer].push(it);
    return b;
  }, [items]);

  // animation helpers
  const animationsEnabled = active && !prefersReduced;
  const durationFall = animationsEnabled ? 0.9 : 0;
  const durationSnap = animationsEnabled ? 0.35 : 0;
  const ringRotateDur = animationsEnabled ? 16 : 0;

  // Effective intensity: auf kleinen Breiten automatisch drosseln
  const effectiveIntensity: 'low' | 'medium' | 'high' = useMemo(() => {
    if (width < 560) return 'low';
    return intensity;
  }, [width, intensity]);
  const sparklesCount = effectiveIntensity === 'high' ? 18 : effectiveIntensity === 'medium' ? 12 : 8;

  // Deterministische Sparkles (PRNG based on seed)
  const sparkleData = useMemo(() => {
    // simple mulberry32 PRNG
    function mulberry32(a: number) {
      return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const seedBase = Math.floor(width * 31 + height * 17 + (effectiveIntensity === 'high' ? 3 : effectiveIntensity === 'medium' ? 2 : 1));
    const rand = mulberry32(seedBase);
    return Array.from({ length: sparklesCount }).map(() => {
      const rr = r3 * (0.4 + rand() * 0.6);
      const ang = rand() * 360;
      const size = 2 + rand() * 2;
      const duration = 2 + rand() * 2;
      const delay = rand() * 2;
      return { rr, ang, size, duration, delay };
    });
  }, [width, height, r3, sparklesCount, effectiveIntensity]);

  // Resolve localized layer names if not provided via props
  const resolvedLayerNames: [string, string, string] = useMemo(() => {
    const defaults: [string, string, string] = [
      t('landing.system.layers.business.short') || 'Business‑KI',
      t('landing.system.layers.agents.short') || 'Agenten',
      t('landing.system.layers.mas.short') || 'MAS',
    ];
    if (layerNames && layerNames.length === 3) return layerNames;
    return defaults;
  }, [layerNames, t]);

  const resolvedAria = ariaLabel || t('landing.system.aria') || 'System Layers Visualization';

  return (
    <div className={className}>
      <svg
        className="block"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={resolvedAria}
        data-testid={testId}
        style={{ fontFamily, willChange: 'transform, opacity' }}
      >
        {/* A11y description for screen readers */}
        <desc>{t('landing.system.ariaDesc') || 'Three concentric rings representing Business AI, Agents, and Multi-Agent System.'}</desc>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0b1020" stopOpacity="1" />
            <stop offset="100%" stopColor="#0b1020" stopOpacity="0" />
          </radialGradient>
          {ringColors.map((c, i) => (
            <radialGradient id={`ringGrad${i}`} key={i} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor={c} stopOpacity="0.9" />
              <stop offset="100%" stopColor={c} stopOpacity="0.15" />
            </radialGradient>
          ))}
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* soft text glow for labels */}
          <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <filter id="badgeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000" floodOpacity="0.35" />
          </filter>
          <filter id="entryBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* background glow removed for transparency */}
        {/* rings: visuals removed to keep background transparent; labels only */}
        {[r1, r2, r3].map((r, idx) => (
          <g key={idx} aria-hidden="true">
            {/* invisible ring path for labels */}
            <path
              id={`ringPath${idx}`}
              d={`M ${cx - r},${cy} a ${r},${r} 0 1,1 ${2 * r},0 a ${r},${r} 0 1,1 -${2 * r},0`}
              fill="none"
            />
            {/* label arc path: top (≈ -70°..70°) or bottom (≈ 110°..250°) */}
            {(() => {
              const degToRad = (a: number) => (a * Math.PI) / 180;
              const [baseStart, baseEnd] = arcSide === 'bottom' ? [110, 250] : [-70, 70];
              const startDeg = baseStart + arcOffsetDeg;
              const endDeg = baseEnd + arcOffsetDeg;
              const startA = degToRad(startDeg);
              const endA = degToRad(endDeg);
              const rr = r + labelArcOffsetPx;
              const x1 = cx + rr * Math.cos(startA);
              const y1 = cy + rr * Math.sin(startA);
              const x2 = cx + rr * Math.cos(endA);
              const y2 = cy + rr * Math.sin(endA);
              const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
              const d = `M ${x1},${y1} A ${rr},${rr} 0 ${largeArc} 1 ${x2},${y2}`;
              return <path id={`labelArc${idx}`} d={d} fill="none" />;
            })()}
          </g>
        ))}

        {/* center halo: ultra-soft, no stroke, keeps background transparent */}
        {animationsEnabled ? (
          <motion.circle
            cx={cx}
            cy={cy}
            r={r1 * 0.5}
            fill={`rgb(var(--rgb-brand-purple))`}
            initial={{ opacity: 0.06, scale: 0.98 }}
            animate={{ opacity: [0.06, 0.09, 0.06], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            filter="url(#soft)"
            aria-hidden
          />
        ) : (
          <circle cx={cx} cy={cy} r={r1 * 0.5} fill={`rgb(var(--rgb-brand-purple))`} opacity={0.08} filter="url(#soft)" aria-hidden />
        )}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#c7d2fe"
          fontSize={12}
          opacity={0.9}
        >
          Core
        </text>

        {/* subtle sparkles (decorative) */}
        {animationsEnabled && (
          <g opacity={0.5} filter="url(#glow)" aria-hidden="true">
            {sparkleData.map((s, i) => {
              const p = polar(cx, cy, s.rr, s.ang);
              return (
                <motion.circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={s.size}
                  fill="#93c5fd"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
                />
              );
            })}
          </g>
        )}

        {/* falling items per ring */}
        {([1, 2, 3] as const).map((ringIndex) => {
          const r = radii[ringIndex - 1];
          const bucket = ringBuckets[ringIndex];
          return bucket.map((it, i) => {
            const angle = (i / Math.max(bucket.length, 1)) * 360 + ringIndex * 12;
            const fallStartY = cy - Math.max(r3 * 1.1, 140);
            const target = polar(cx, cy, r, angle);

            // After falling + snapping, orbit around the ring
            const orbitDuration = animationsEnabled ? 360 / orbitSpeed : 0;

            const R = it.size ?? 10;
            return (
              <g key={it.id}>
                {/* entry plume */}
                {!prefersReduced && (
                  <motion.line
                    x1={cx}
                    y1={fallStartY - 20}
                    x2={cx}
                    y2={cy - r - 18}
                    stroke={it.color || '#60a5fa'}
                    strokeOpacity={0.2}
                    strokeWidth={2}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
                    transition={{ duration: durationFall, delay: it.delay ?? 0 }}
                  />
                )}

                <motion.g
                  initial={{ x: cx, y: fallStartY, opacity: 0 }}
                  animate={
                    prefersReduced
                      ? { x: target.x, y: target.y, opacity: 1, scale: 1 }
                      : {
                          x: [cx, cx, target.x],
                          y: [fallStartY, cy - r - 16, target.y],
                          opacity: [0, 0.95, 1],
                          scale: [0.6, 1.1, 1],
                        }
                  }
                  transition={
                    prefersReduced
                      ? { duration: 0 }
                      : {
                          duration: durationFall + durationSnap,
                          ease: 'easeOut',
                          delay: it.delay ?? 0,
                          times: [0, durationFall / (durationFall + durationSnap), 1],
                        }
                  }
                >
                  {/* badge */}
                  <circle
                    r={R}
                    fill={it.color || '#60a5fa'}
                    stroke="#ffffff"
                    strokeOpacity={0.45}
                    filter="url(#badgeShadow)"
                  />
                  {/* icon/emoji */}
                  {it.emoji && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={R}
                      x={0}
                      y={1}
                      style={{ pointerEvents: 'none' }}
                    >
                      {it.emoji}
                    </text>
                  )}
                </motion.g>

                {animationsEnabled && (
                  <motion.g
                    initial={{ x: target.x, y: target.y, opacity: 0, scale: 1 }}
                    animate={{
                      x: [
                        polar(cx, cy, r, angle + 0).x,
                        polar(cx, cy, r, angle + 120).x,
                        polar(cx, cy, r, angle + 240).x,
                        polar(cx, cy, r, angle + 360).x,
                      ],
                      y: [
                        polar(cx, cy, r, angle + 0).y,
                        polar(cx, cy, r, angle + 120).y,
                        polar(cx, cy, r, angle + 240).y,
                        polar(cx, cy, r, angle + 360).y,
                      ],
                      opacity: 1,
                      scale: [1, 1.06, 1],
                    }}
                    transition={{
                      delay: (it.delay ?? 0) + durationFall + durationSnap,
                      repeat: Infinity,
                      duration: orbitDuration,
                      ease: 'linear',
                    }}
                  >
                    <circle
                      r={R}
                      fill={it.color || '#60a5fa'}
                      stroke="#ffffff"
                      strokeOpacity={0.35}
                      filter="url(#badgeShadow)"
                    />
                    {it.emoji && (
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={R}
                        x={0}
                        y={1}
                        style={{ pointerEvents: 'none' }}
                      >
                        {it.emoji}
                      </text>
                    )}
                  </motion.g>
                )}
              </g>
            );
          });
        })}

        {/* Layer Labels */}
        {labelMode === 'arc' ? (
          <g
            opacity={0.92}
            fontSize={labelSize}
            style={{ letterSpacing: 0.6, fontWeight: labelWeight }}
            filter="url(#textGlow)"
          >
            {[r1, r2, r3].map((r, i) => (
              <text key={i} fill={ringColors[i] ?? labelColor}>
                <textPath href={`#labelArc${i}`} startOffset="50%" textAnchor="middle">
                  {resolvedLayerNames[i]}
                </textPath>
              </text>
            ))}
          </g>
        ) : labelMode === 'arc-vertical' ? (
          <g opacity={0.95} fill={labelColor} fontSize={labelSize} filter="url(#textGlow)">
            {[r1, r2, r3].map((r, i) => (
              <text key={i} style={{ writingMode: 'vertical-rl' as any }}>
                <textPath href={`#labelArc${i}`} startOffset="50%" textAnchor="middle">
                  {resolvedLayerNames[i]}
                </textPath>
              </text>
            ))}
          </g>
        ) : labelMode === 'right-column' ? (
          <g
            opacity={0.96}
            fill={labelColor}
            fontSize={labelSize}
            style={{ fontWeight: labelWeight }}
            textAnchor="start"
            filter="url(#textGlow)"
          >
            {(() => {
              // Position rechts neben dem äußeren Ring, vertikal gestapelt
              const x = cx + r3 + 18; // 18px Abstand nach außen
              const spacing = 22;
              const ys = [cy - spacing, cy, cy + spacing];
              return ys.map((y, i) => (
                <text key={i} x={x} y={y} dominantBaseline="middle">
                  {resolvedLayerNames[i]}
                </text>
              ));
            })()}
          </g>
        ) : (
          <g
            opacity={0.95}
            fill={labelColor}
            fontSize={labelSize}
            style={{ letterSpacing: 0.5, fontWeight: labelWeight }}
            textAnchor="middle"
            filter="url(#textGlow)"
          >
            {(() => {
              const spacing = 22;
              const ys = [cy - spacing, cy, cy + spacing]; // top->bottom
              return ys.map((y, i) => (
                <text key={i} x={cx} y={y} dominantBaseline="middle">
                  {resolvedLayerNames[i]}
                </text>
              ));
            })()}
          </g>
        )}
      </svg>
    </div>
  );
};

export default SystemLayersVisual;
