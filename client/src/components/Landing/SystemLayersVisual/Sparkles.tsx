import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { polar } from './utils';

// Local Sparkle type to avoid cross-module dependency
type Sparkle = {
  rr: number; // radius from center
  ang: number; // angle in degrees
  size: number; // circle radius
  duration: number; // animation duration
  delay: number; // animation delay
};

type SparklesProps = {
  cx: number;
  cy: number;
  r3: number;
  sparkleData: Sparkle[];
  animationsEnabled: boolean;
  intensity?: 'low' | 'medium' | 'high';
  idPrefix: string;
};

const intensityOpacity = (i: NonNullable<SparklesProps['intensity']>) => (i === 'high' ? 0.6 : i === 'medium' ? 0.5 : 0.38);

const SparklesComp: React.FC<SparklesProps> = ({ cx, cy, sparkleData, animationsEnabled, intensity = 'medium', idPrefix }) => {
  const prefersReduced = useReducedMotion();
  if (!animationsEnabled) return null;

  const baseOpacity = intensityOpacity(intensity);
  const keyOpacity = prefersReduced ? [0, 0, 0] : [0, baseOpacity, 0];
  const groupOpacity = intensity === 'high' ? 0.5 : intensity === 'medium' ? 0.45 : 0.38;

  return (
    <g opacity={groupOpacity} filter={`url(#${idPrefix}-glow)`} aria-hidden="true">
      {sparkleData.map((s) => {
        const p = polar(cx, cy, s.rr, s.ang);
        return (
          <motion.circle
            key={`${idPrefix}-${s.rr}-${s.ang}-${s.delay}`}
            cx={p.x}
            cy={p.y}
            r={s.size}
            fill="#93c5fd"
            animate={{ opacity: keyOpacity }}
            transition={{ duration: prefersReduced ? 0 : s.duration, repeat: prefersReduced ? 0 : Infinity, delay: s.delay }}
          />
        );
      })}
    </g>
  );
};

export const Sparkles = React.memo(SparklesComp);

export default Sparkles;
