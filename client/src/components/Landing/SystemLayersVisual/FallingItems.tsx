import React from 'react';
import { motion } from 'framer-motion';
import { polar, chordPath } from './utils.js';
import type { LayerItem } from './types.js';

type Selected = {
  id: string;
  title: string;
  emoji?: string;
  color?: string;
  svgX: number;
  svgY: number;
} | null;

type FallingItemsProps = {
  cx: number;
  cy: number;
  radii: [number, number, number];
  r3: number;
  ringBuckets: Record<1 | 2 | 3, LayerItem[]>;
  orbitSpeed: number;
  animationsEnabled: boolean;
  durationFall: number;
  durationSnap: number;
  prefersReduced: boolean;
  mouse: { x: number; y: number } | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null | ((id: string | null) => string | null)) => void;
  setSelected: (sel: Selected) => void;
  idPrefix: string;
};

export const FallingItems: React.FC<FallingItemsProps> = ({
  cx,
  cy,
  radii,
  r3,
  ringBuckets,
  orbitSpeed,
  animationsEnabled,
  durationFall,
  durationSnap,
  prefersReduced,
  mouse,
  hoveredId,
  setHoveredId,
  setSelected,
  idPrefix,
}) => {
  return (
    <>
      {([1, 2, 3] as const).map((ringIndex) => {
        const r = radii[ringIndex - 1];
        const bucket = ringBuckets[ringIndex];
        return bucket.map((it, i) => {
          const golden = 137.50776405003785;
          const angle = ((i * golden) % 360) + ringIndex * 12;
          const fallStartY = cy - Math.max(r3 * 1.1, 140);
          const target = polar(cx, cy, r, angle);

          const mag = (() => {
            if (!mouse || prefersReduced) return { ox: 0, oy: 0 };
            const dx = mouse.x - target.x;
            const dy = mouse.y - target.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 120) return { ox: 0, oy: 0 };
            const f = Math.min(1, (120 - dist) / 120);
            const scale = 4 * f;
            return { ox: (dx / (dist || 1)) * scale, oy: (dy / (dist || 1)) * scale };
          })();

          const orbitDuration = animationsEnabled ? 360 / orbitSpeed : 0;
          const R = it.size ?? 10;

          return (
            <g key={it.id}>
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
                <circle
                  r={R}
                  fill={it.color || '#60a5fa'}
                  stroke="#ffffff"
                  strokeOpacity={0.45}
                  filter={`url(#${idPrefix}-badgeShadow)`}
                  vectorEffect="non-scaling-stroke"
                  onMouseEnter={() => setHoveredId(it.id)}
                  onMouseLeave={() => setHoveredId((id) => (id === it.id ? null : id))}
                  onClick={() => setSelected({ id: it.id, title: it.label ?? it.id, emoji: it.emoji, color: it.color, svgX: target.x, svgY: target.y })}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected({ id: it.id, title: it.label ?? it.id, emoji: it.emoji, color: it.color, svgX: target.x, svgY: target.y });
                    }
                  }}
                />
                {it.emoji && (
                  <text textAnchor="middle" dominantBaseline="central" fontSize={R} x={0} y={1} style={{ pointerEvents: 'none' }}>
                    {it.emoji}
                  </text>
                )}
              </motion.g>

              {animationsEnabled && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ rotate: (ringIndex % 2 === 0 ? -1 : 1) * 360, opacity: 1 }}
                  transition={{
                    delay: (it.delay ?? 0) + durationFall + durationSnap,
                    repeat: Infinity,
                    duration: orbitDuration * (1 + (ringIndex - 1) * 0.25),
                    ease: 'linear',
                  }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                >
                  <g transform={`translate(${cx},${cy})`}>
                    <g transform={`translate(${polar(cx, cy, r, angle).x - cx + mag.ox},${polar(cx, cy, r, angle).y - cy + mag.oy})`}>
                      <circle
                        r={R}
                        fill={it.color || '#60a5fa'}
                        stroke="#ffffff"
                        strokeOpacity={0.35}
                        filter={`url(#${idPrefix}-badgeShadow)`}
                        vectorEffect="non-scaling-stroke"
                        onMouseEnter={() => setHoveredId(it.id)}
                        onMouseLeave={() => setHoveredId((id) => (id === it.id ? null : id))}
                        onClick={() => setSelected({ id: it.id, title: it.label ?? it.id, emoji: it.emoji, color: it.color, svgX: target.x + mag.ox, svgY: target.y + mag.oy })}
                      />
                      {it.emoji && (
                        <text textAnchor="middle" dominantBaseline="central" fontSize={R} x={0} y={1} style={{ pointerEvents: 'none' }}>
                          {it.emoji}
                        </text>
                      )}
                    </g>
                  </g>
                </motion.g>
              )}

              {hoveredId === it.id && (
                <g aria-hidden>
                  <motion.path
                    d={chordPath(cx, cy, target.x, target.y, 0.16)}
                    stroke={it.color || '#60a5fa'}
                    strokeOpacity={0.42}
                    strokeWidth={1.4}
                    fill="none"
                    strokeDasharray="4 10"
                    initial={{ pathLength: 0, opacity: 0, strokeDashoffset: 0 }}
                    animate={{ pathLength: 1, opacity: 1, strokeDashoffset: -40 }}
                    transition={{ duration: 0.35, ease: 'easeOut', repeat: Infinity, repeatType: 'loop', repeatDelay: 0 }}
                    filter={`url(#${idPrefix}-glow)`}
                  />
                  <motion.circle
                    cx={target.x}
                    cy={target.y}
                    r={R * 1.2}
                    fill="none"
                    stroke={it.color || '#60a5fa'}
                    strokeOpacity={0.35}
                    initial={{ scale: 0.92, opacity: 0.4 }}
                    animate={{ scale: 1.12, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    filter={`url(#${idPrefix}-glow)`}
                  />
                </g>
              )}
            </g>
          );
        });
      })}
    </>
  );
};

export default FallingItems;
