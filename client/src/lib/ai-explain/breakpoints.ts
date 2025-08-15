// Runtime Breakpoint Detection aligned with Tailwind defaults
export type TailwindBP = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const queries: Record<TailwindBP, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

export function getActiveBreakpoint(): TailwindBP | 'base' {
  if (typeof window === 'undefined') return 'base';
  const order: TailwindBP[] = ['2xl', 'xl', 'lg', 'md', 'sm'];
  for (const bp of order) {
    if (window.matchMedia(queries[bp]).matches) return bp;
  }
  return 'base';
}

export function onBreakpointChange(cb: (bp: TailwindBP | 'base') => void) {
  if (typeof window === 'undefined') return () => {};
  const mqls = Object.entries(queries).map(([bp, q]) => ({
    bp: bp as TailwindBP,
    mql: window.matchMedia(q),
  }));
  const handler = () => cb(getActiveBreakpoint());
  mqls.forEach(({ mql }) => mql.addEventListener?.('change', handler));
  return () => {
    mqls.forEach(({ mql }) => mql.removeEventListener?.('change', handler));
  };
}
