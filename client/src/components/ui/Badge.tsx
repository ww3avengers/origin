import React from 'react';
import { cn } from '~/utils';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgeTone = 'soft' | 'solid' | 'outline';
// Section/Theme-Varianten: können bei Bedarf erweitert werden
export type BadgeVariant =
  | 'neutral'
  | 'brand'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'system'
  | 'security'
  | 'pricing'
  | 'agent'
  | 'blog'
  // Landing section specific variants
  | 'hero'
  | 'features'
  | 'usecases'
  | 'testimonials'
  | 'comparison'
  | 'faq'
  | 'dataprivacy'
  | 'plans';

export interface UIBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'div' | 'button';
  size?: BadgeSize;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children: React.ReactNode;
}

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[10px] leading-4',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-3.5 py-1.5 text-[0.95rem] md:text-base',
};

// Farbzuordnung je Variant & Tone; nutzt Tailwind + leichte Opazitäten
const toneByVariant: Record<BadgeVariant, Record<BadgeTone, string>> = {
  neutral: {
    soft: 'bg-white/5 text-zinc-200 ring-1 ring-white/10',
    solid: 'bg-zinc-700 text-white',
    outline: 'bg-transparent text-zinc-200 ring-1 ring-zinc-500/40',
  },
  brand: {
    soft: 'bg-[rgb(var(--rgb-brand-purple))]/10 text-[rgb(var(--rgb-brand-purple))] ring-1 ring-[rgb(var(--rgb-brand-purple))]/30',
    solid: 'bg-[rgb(var(--rgb-brand-purple))] text-white',
    outline: 'bg-transparent text-[rgb(var(--rgb-brand-purple))] ring-1 ring-[rgb(var(--rgb-brand-purple))]/40',
  },
  primary: {
    soft: 'bg-indigo-400/15 text-indigo-100 ring-1 ring-indigo-300/40',
    solid: 'bg-indigo-500 text-white',
    outline: 'bg-transparent text-indigo-300 ring-1 ring-indigo-400/50',
  },
  info: {
    soft: 'bg-cyan-300/15 text-cyan-100 ring-1 ring-[rgb(var(--accent-ring))]/40',
    solid: 'bg-cyan-500 text-white',
    outline: 'bg-transparent text-cyan-300 ring-1 ring-[rgb(var(--accent-ring))]/40',
  },
  success: {
    soft: 'bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/40',
    solid: 'bg-emerald-500 text-white',
    outline: 'bg-transparent text-emerald-300 ring-1 ring-emerald-400/40',
  },
  warning: {
    soft: 'bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/40',
    solid: 'bg-amber-500 text-black',
    outline: 'bg-transparent text-amber-300 ring-1 ring-amber-400/40',
  },
  danger: {
    soft: 'bg-rose-400/15 text-rose-100 ring-1 ring-rose-400/50',
    solid: 'bg-rose-500 text-white',
    outline: 'bg-transparent text-rose-300 ring-1 ring-rose-400/50',
  },
  system: {
    soft: 'bg-sky-400/15 text-sky-100 ring-1 ring-[rgb(var(--accent-ring))]/40',
    solid: 'bg-sky-500 text-white',
    outline: 'bg-transparent text-sky-300 ring-1 ring-[rgb(var(--accent-ring))]/40',
  },
  security: {
    soft: 'bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/40',
    solid: 'bg-emerald-500 text-white',
    outline: 'bg-transparent text-emerald-300 ring-1 ring-emerald-400/40',
  },
  pricing: {
    soft: 'bg-sky-400/15 text-sky-100 ring-1 ring-sky-300/40',
    solid: 'bg-sky-500 text-white',
    outline: 'bg-transparent text-sky-300 ring-1 ring-sky-400/40',
  },
  agent: {
    soft: 'bg-indigo-400/15 text-indigo-100 ring-1 ring-[rgb(var(--accent-ring))]/40',
    solid: 'bg-indigo-500 text-white',
    outline: 'bg-transparent text-indigo-300 ring-1 ring-[rgb(var(--accent-ring))]/40',
  },
  blog: {
    soft: 'bg-blue-400/15 text-blue-100 ring-1 ring-blue-300/40',
    solid: 'bg-blue-500 text-white',
    outline: 'bg-transparent text-blue-300 ring-1 ring-blue-400/40',
  },
  // Landing section specific variants with subtle distinct hues
  hero: {
    soft: 'bg-sky-400/15 text-sky-100 ring-1 ring-sky-300/40',
    solid: 'bg-sky-500 text-white',
    outline: 'bg-transparent text-sky-300 ring-1 ring-sky-400/40',
  },
  features: {
    soft: 'bg-violet-400/15 text-violet-100 ring-1 ring-violet-300/40',
    solid: 'bg-violet-500 text-white',
    outline: 'bg-transparent text-violet-300 ring-1 ring-violet-400/40',
  },
  usecases: {
    soft: 'bg-indigo-400/15 text-indigo-100 ring-1 ring-indigo-300/40',
    solid: 'bg-indigo-500 text-white',
    outline: 'bg-transparent text-indigo-300 ring-1 ring-indigo-400/40',
  },
  testimonials: {
    soft: 'bg-fuchsia-400/15 text-fuchsia-100 ring-1 ring-fuchsia-300/40',
    solid: 'bg-fuchsia-500 text-white',
    outline: 'bg-transparent text-fuchsia-300 ring-1 ring-fuchsia-400/40',
  },
  comparison: {
    soft: 'bg-purple-400/15 text-purple-100 ring-1 ring-purple-300/40',
    solid: 'bg-purple-600 text-white',
    outline: 'bg-transparent text-purple-300 ring-1 ring-purple-400/40',
  },
  faq: {
    soft: 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/40',
    solid: 'bg-cyan-500 text-white',
    outline: 'bg-transparent text-cyan-300 ring-1 ring-cyan-400/40',
  },
  dataprivacy: {
    soft: 'bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/40',
    solid: 'bg-emerald-600 text-white',
    outline: 'bg-transparent text-emerald-300 ring-1 ring-emerald-400/40',
  },
  plans: {
    soft: 'bg-sky-400/15 text-sky-100 ring-1 ring-sky-300/40',
    solid: 'bg-sky-600 text-white',
    outline: 'bg-transparent text-sky-300 ring-1 ring-sky-400/40',
  },
};

export const Badge: React.FC<UIBadgeProps> = ({
  as = 'span',
  size = 'xs',
  tone = 'soft',
  variant = 'neutral',
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}) => {
  const Component = as as any;
  return (
    <Component
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap select-none',
        sizeClasses[size],
        toneByVariant[variant][tone],
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <span className="mr-1.5 inline-flex h-3.5 w-3.5 items-center justify-center">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className="ml-1.5 inline-flex h-3.5 w-3.5 items-center justify-center">{trailingIcon}</span> : null}
    </Component>
  );
};

export default Badge;
