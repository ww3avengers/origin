import React, { ElementType, PropsWithChildren } from 'react';

// minimal cn utility to avoid external dependency
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export type GlassCardProps<T extends ElementType = 'div'> = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  highlight?: boolean; // z.B. für "Most Popular"
  as?: T;
}>;

/**
 * GlassCard
 * Einheitlicher Container mit Gradient-Border + Glass/Blur-Hintergrund
 */
export const GlassCard = <T extends ElementType = 'div'>({
  className,
  contentClassName,
  highlight = false,
  as,
  children,
}: GlassCardProps<T>) => {
  const Component = (as || 'div') as ElementType;
  return (
    <div
      className={cn(
        'relative rounded-2xl p-[1px] shadow-xl shadow-black/20',
        highlight ? 'bg-gradient-to-b from-sky-400/35 via-sky-300/25 to-sky-500/20' : 'bg-white/10',
        className,
      )}
    >
      <Component
        className={cn(
          'rounded-2xl border border-white/10 backdrop-blur-md',
          highlight ? 'bg-gradient-to-b from-sky-950/50 to-slate-950/30' : 'bg-gray-900/60',
          contentClassName,
        )}
      >
        {children}
      </Component>
    </div>
  );
};

export default GlassCard;
