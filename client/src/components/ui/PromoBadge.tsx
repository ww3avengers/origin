import React from 'react';
import { cn } from '~/utils';

export interface PromoBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: React.ReactNode | string;
  /** visual tone; accent adds a slight colored hint */
  tone?: 'neutral' | 'accent';
  /** size preset */
  size?: 'sm' | 'md';
}

/**
 * PromoBadge – edler, dezenter Badge für Hero-Highlights.
 * - Glasmorphism Base mit leichtem Rand und Blur
 * - Subtiles radiales Rim-Light (before)
 * - SmallCaps/Uppercase mit moderatem Tracking
 * - Responsiv auf XS/SM
 */
export const PromoBadge: React.FC<PromoBadgeProps> = ({
  label,
  icon,
  tone = 'neutral',
  size = 'md',
  className,
  ...rest
}) => {
  const sz = size === 'sm'
    // Extra kompakt: geringere Höhe auf allen Viewports
    ? 'px-2.5 py-0.5 text-[10.5px] sm:px-3 sm:py-0.5 sm:text-[11px]'
    // md: ebenfalls schlanker auf allen Viewports
    : 'px-3 py-0.5 text-[11.5px] sm:px-3.5 sm:py-0.5 sm:text-[12.5px]';

  const toneBase =
    tone === 'accent'
      ? 'supports-[backdrop-filter]:bg-[rgb(var(--accent-ring))/0.06] bg-white/5 ring-[rgb(var(--accent-ring))/0.25]'
      : 'supports-[backdrop-filter]:bg-white/5 bg-white/5 ring-white/10';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative inline-flex select-none items-center gap-1.5 sm:gap-2 rounded-full backdrop-blur-md',
        'ring-1 ring-inset',
        'before:pointer-events-none before:absolute before:inset-[-1px] before:rounded-[inherit] before:content-[""]',
        'before:[background:radial-gradient(120%_100%_at_0%_50%,rgba(255,255,255,0.16),transparent_60%)]',
        'text-gray-100 uppercase tracking-[0.08em] font-medium',
        sz,
        toneBase,
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span aria-hidden className="inline-flex items-center text-[11px] sm:text-[13px] opacity-90">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </div>
  );
};

export default PromoBadge;
