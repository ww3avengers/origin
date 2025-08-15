import React from 'react';
import { motion } from 'framer-motion';

type CenterHaloProps = {
  cx: number;
  cy: number;
  r: number;
  animationsEnabled: boolean;
  idPrefix: string;
};

export const CenterHalo: React.FC<CenterHaloProps> = ({ cx, cy, r, animationsEnabled, idPrefix }) => {
  return (
    <>
      {animationsEnabled ? (
        <motion.circle
          cx={cx}
          cy={cy}
          r={r * 0.48}
          fill={`rgb(var(--rgb-brand-purple))`}
          initial={{ opacity: 0.05, scale: 0.985 }}
          animate={{ opacity: [0.05, 0.08, 0.05], scale: [0.985, 1.015, 0.985] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
          filter={`url(#${idPrefix}-soft)`}
          aria-hidden
        />
      ) : (
        <circle cx={cx} cy={cy} r={r * 0.48} fill={`rgb(var(--rgb-brand-purple))`} opacity={0.07} filter={`url(#${idPrefix}-soft)`} aria-hidden />
      )}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#c7d2fe" fontSize={12} opacity={0.9}>
        Core
      </text>
    </>
  );
};

export default CenterHalo;
