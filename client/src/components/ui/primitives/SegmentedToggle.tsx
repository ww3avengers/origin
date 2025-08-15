import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type SegmentedOption<K extends string | number = string> = {
  key: K;
  label: React.ReactNode;
  ariaLabel?: string;
};

export type SegmentedToggleProps<K extends string | number = string> = {
  options: SegmentedOption<K>[];
  selectedKey: K;
  onChange: (key: K) => void;
  className?: string;
  size?: 'sm' | 'md';
  ariaLabel?: string;
};

/**
 * SegmentedToggle
 * Zugänglicher, responsiver Segment-Toggle mit animiertem Indikator
 */
export default function SegmentedToggle<K extends string | number = string>({
  options,
  selectedKey,
  onChange,
  className,
  size = 'md',
  ariaLabel,
}: SegmentedToggleProps<K>) {
  const prefersReduced = useReducedMotion() ?? false;
  const idx = Math.max(
    0,
    options.findIndex((o) => o.key === selectedKey),
  );
  const count = Math.max(1, options.length);

  const padding = size === 'sm' ? 4 : 6; // px
  const width = `calc((100% - ${2 * padding}px) / ${count})`;
  const left = `calc(${padding}px + ((100% - ${2 * padding}px) / ${count}) * ${idx})`;

  return (
    <div
      className={`relative inline-flex rounded-full border border-white/15 bg-white/5 backdrop-blur-md transition-colors ${className ?? ''}`}
      style={{ padding }}
      role="tablist"
      aria-label={ariaLabel}
    >
      <motion.div
        className="absolute rounded-full bg-gradient-to-r from-sky-700 to-sky-600 shadow-lg shadow-sky-700/30"
        initial={false}
        style={{ top: padding, bottom: padding }}
        animate={{ left, width }}
        transition={{ type: prefersReduced ? 'tween' : 'spring', stiffness: 300, damping: 26 }}
        aria-hidden
      />
      {options.map((opt, i) => {
        const selected = i === idx;
        return (
          <button
            key={String(opt.key)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={opt.ariaLabel}
            onClick={() => onChange(opt.key)}
            className={`relative z-10 rounded-full font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-6 py-2 text-sm'
            } ${selected ? 'text-white' : 'text-slate-200 hover:text-white'}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
