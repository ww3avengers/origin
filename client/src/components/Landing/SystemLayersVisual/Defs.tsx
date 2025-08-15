import React from 'react';

type DefsProps = {
  ringColors: [string, string, string];
  mouse: { x: number; y: number } | null;
  r3: number;
  idPrefix?: string;
};

export const Defs: React.FC<DefsProps> = ({ ringColors, mouse, r3, idPrefix = 'syslayers' }) => {
  return (
    <defs>
      <radialGradient id={`${idPrefix}-bgGlow`} cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#0b1020" stopOpacity="1" />
        <stop offset="100%" stopColor="#0b1020" stopOpacity="0" />
      </radialGradient>
      {ringColors.map((c, i) => (
        <radialGradient id={`${idPrefix}-ringGrad${i}`} key={i} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={c} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c} stopOpacity="0.15" />
        </radialGradient>
      ))}
      {mouse && (
        <radialGradient id={`${idPrefix}-spot`} gradientUnits="userSpaceOnUse" cx={mouse.x} cy={mouse.y} r={Math.max(120, r3 * 0.5)}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="40%" stopColor="#93c5fd" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      )}
      <filter id={`${idPrefix}-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Prefixed duplicate for scoping (used by Sparkles) */}
      <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`${idPrefix}-textGlow`} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#000" floodOpacity="0.35" />
      </filter>
      <filter id={`${idPrefix}-badgeShadow`} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000" floodOpacity="0.35" />
      </filter>
      <filter id={`${idPrefix}-entryBlur`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.4" />
      </filter>
    </defs>
  );
};

export default Defs;
