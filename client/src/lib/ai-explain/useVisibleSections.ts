import { useEffect, useMemo, useState } from 'react';
import type { VisibleSection } from './types';

export function useVisibleSections(rootMargin = '0px 0px -30% 0px') {
  const [sections, setSections] = useState<VisibleSection[]>([]);

  const observer = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => {
            const el = e.target as HTMLElement;
            return {
              id: el.getAttribute('data-ai-section') || el.id || 'unknown',
              title: el.getAttribute('data-ai-title') || undefined,
              el,
            } as VisibleSection;
          });
        // Keep unique by id, preserve order by viewport position
        const map = new Map<string, VisibleSection>();
        visible.forEach((v) => map.set(v.id, v));
        setSections(Array.from(map.values()));
      },
      { root: null, rootMargin, threshold: [0.1, 0.25, 0.5] },
    );
  }, [rootMargin]);

  useEffect(() => {
    if (!observer) return;
    const nodes = Array.from(document.querySelectorAll('[data-ai-section]')) as HTMLElement[];
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [observer]);

  return sections;
}
