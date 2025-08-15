import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

export interface HorizontalCardCarouselProps {
  children: React.ReactNode;
  className?: string;
  /** gap between cards (Tailwind classes) */
  gapClassName?: string;
  /** show left/right helper shadows */
  shadows?: boolean;
  /** show prev/next buttons */
  arrows?: boolean;
  /** label for previous button */
  prevLabel?: string;
  /** label for next button */
  nextLabel?: string;
  /** snap alignment */
  snap?: 'start' | 'center' | 'end';
  /** peek space on the right to hint more content (e.g. 'pr-8') */
  peekClassName?: string;
  /** autoplay in ms; 0 disables */
  autoplayMs?: number;
  /** pause autoplay on hover/focus */
  pauseOnInteract?: boolean;
  /** on index change (approx via scroll position) */
  onIndexChange?: (index: number) => void;
}

/**
 * Headless horizontal carousel using CSS scroll-snap + momentum scrolling.
 * - No external deps; uses Tailwind utilities and Framer Motion for subtle fades.
 * - Accessible: keyboard arrow navigation, focus rings, reduced-motion.
 */
const HorizontalCardCarousel: React.FC<HorizontalCardCarouselProps> = ({
  children,
  className,
  gapClassName = 'gap-4',
  shadows = true,
  arrows = true,
  prevLabel = 'Prev',
  nextLabel = 'Next',
  snap = 'center',
  peekClassName = 'pr-6',
  autoplayMs = 0,
  pauseOnInteract = true,
  onIndexChange,
}) => {
  const prefersReduced = useReducedMotion() ?? false;
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [leftShadow, setLeftShadow] = useState(false);
  const [rightShadow, setRightShadow] = useState(true);
  // Track page visibility and in-viewport status to avoid unnecessary autoplay work
  const isPageVisibleRef = useRef(true);
  const isInViewportRef = useRef(true);

  const itemsCount = useMemo(() => React.Children.count(children), [children]);

  const updateShadows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setLeftShadow(scrollLeft > 2);
    setRightShadow(scrollLeft + clientWidth < scrollWidth - 2);
    if (onIndexChange) {
      const itemWidth =
        el.firstElementChild instanceof HTMLElement
          ? el.firstElementChild.clientWidth
          : clientWidth;
      const approxIndex = Math.round(scrollLeft / Math.max(1, itemWidth));
      onIndexChange(Math.min(itemsCount - 1, Math.max(0, approxIndex)));
    }
  }, [itemsCount, onIndexChange]);

  useEffect(() => {
    updateShadows();
  }, [updateShadows, children]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = () => updateShadows();
    el.addEventListener('scroll', handler, { passive: true });
    const resize = () => updateShadows();
    window.addEventListener('resize', resize);
    return () => {
      el.removeEventListener('scroll', handler as any);
      window.removeEventListener('resize', resize);
    };
  }, [updateShadows]);

  // Keep an SSR-safe visibility flag for autoplay pausing
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const onVis = () => {
      isPageVisibleRef.current = !document.hidden;
    };
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Observe if the scroller is in the viewport to gate autoplay
  useEffect(() => {
    if (!autoplayMs) return;
    if (typeof window === 'undefined') return;
    const el = scrollerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          isInViewportRef.current = entry.isIntersecting;
        }
      },
      { root: null, threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplayMs]);

  useEffect(() => {
    if (!autoplayMs || prefersReduced) return;
    let raf: number | null = null;
    let last = performance.now();
    const tick = (now: number) => {
      // Pause autoplay while interacting, tab hidden, or scroller out of view
      if (
        (isInteracting && pauseOnInteract) ||
        !isPageVisibleRef.current ||
        !isInViewportRef.current
      ) {
        last = now;
      } else if (now - last >= autoplayMs) {
        last = now;
        const el = scrollerRef.current;
        if (el) {
          el.scrollBy({ left: el.clientWidth * 0.85, behavior: 'smooth' });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [autoplayMs, prefersReduced, isInteracting, pauseOnInteract]);

  const scrollBy = (dir: 'prev' | 'next') => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.85 * (dir === 'prev' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className={clsx('relative', className)}>
      {shadows && (
        <>
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: leftShadow ? 1 : 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background to-transparent"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: rightShadow ? 1 : 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent"
          />
        </>
      )}

      <div
        ref={scrollerRef}
        role="list"
        className={clsx(
          'flex overflow-x-auto pb-2',
          gapClassName,
          peekClassName,
          'snap-x snap-mandatory',
          'scroll-pt-2',
          '[-webkit-overflow-scrolling:touch]',
        )}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        onFocus={() => setIsInteracting(true)}
        onBlur={() => setIsInteracting(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') scrollBy('next');
          if (e.key === 'ArrowLeft') scrollBy('prev');
        }}
        aria-roledescription="carousel"
      >
        {React.Children.map(children, (child, i) => (
          <div
            role="listitem"
            aria-label={`Slide ${i + 1} of ${itemsCount}`}
            className={clsx(
              'shrink-0',
              snap === 'center' && 'snap-center',
              snap === 'start' && 'snap-start',
              snap === 'end' && 'snap-end',
              'basis-[85%] md:basis-[60%] lg:basis-[33%]',
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {arrows && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            className="rounded-md border border-border/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-foreground/5"
            onClick={() => scrollBy('prev')}
            aria-label={prevLabel}
          >
            {prevLabel}
          </button>
          <button
            type="button"
            className="rounded-md border border-border/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-foreground/5"
            onClick={() => scrollBy('next')}
            aria-label={nextLabel}
          >
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default HorizontalCardCarousel;
