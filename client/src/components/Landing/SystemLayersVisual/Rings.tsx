import React from 'react';
import { motion } from 'framer-motion';

type RingsProps = {
  cx: number;
  cy: number;
  radii: [number, number, number];
  ringColors: [string, string, string];
  animationsEnabled: boolean;
  ringRotateDur: number;
};

export const Rings: React.FC<RingsProps> = ({ cx, cy, radii: [r1, r2, r3], ringColors, animationsEnabled, ringRotateDur }) => {
  const RingEl: React.FC<{ r: number; color: string; reverse?: boolean }> = ({ r, color, reverse }) => {
    if (!animationsEnabled) {
      return <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeOpacity={0.55} strokeWidth={1.5} />;
    }
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeOpacity={0.55}
        strokeWidth={1.5}
        initial={{ rotate: 0, opacity: 1 }}
        animate={{ rotate: reverse ? -360 : 360, opacity: 1 }}
        transition={{ duration: Math.max(2, ringRotateDur), repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    );
  };

  return (
    <g aria-hidden="true">
      <RingEl r={r3} color={ringColors[2]} />
      <RingEl r={r2} color={ringColors[1]} reverse />
      <RingEl r={r1} color={ringColors[0]} />
    </g>
  );
};

export default Rings;
