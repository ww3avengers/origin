import { useMemo } from 'react';
import type { LayerItem, SystemLayersVisualProps } from './types.js';

export function useRadii(width: number, height: number) {
  const baseMin = Math.min(width, height);
  const margin = Math.max(8, Math.floor(baseMin * 0.02));
  const r3 = Math.max(10, baseMin / 2 - margin);
  const r2 = r3 * 0.74;
  const r1 = r3 * 0.47;
  const radii: [number, number, number] = [r1, r2, r3];
  return { r1, r2, r3, radii };
}

export function useRingBuckets(items: LayerItem[]) {
  return useMemo(() => {
    const b: Record<1 | 2 | 3, LayerItem[]> = { 1: [], 2: [], 3: [] };
    for (const it of items) b[it.toLayer].push(it);
    return b;
  }, [items]);
}

export function useAnimationsEnabled(active: boolean, prefersReduced: boolean) {
  const animationsEnabled = active && !prefersReduced;
  const durationFall = animationsEnabled ? 0.9 : 0;
  const durationSnap = animationsEnabled ? 0.35 : 0;
  const ringRotateDur = animationsEnabled ? 16 : 0;
  return { animationsEnabled, durationFall, durationSnap, ringRotateDur };
}

export function useEffectiveIntensity(width: number, intensity: SystemLayersVisualProps['intensity']) {
  return useMemo<'low' | 'medium' | 'high'>(() => {
    if (width < 560) return 'low';
    return intensity ?? 'medium';
  }, [width, intensity]);
}

export type Sparkle = { rr: number; ang: number; size: number; duration: number; delay: number };
export function useSparkles(width: number, height: number, r3: number, effectiveIntensity: 'low' | 'medium' | 'high') {
  const sparklesCount = effectiveIntensity === 'high' ? 18 : effectiveIntensity === 'medium' ? 12 : 8;
  const sparkleData = useMemo<Sparkle[]>(() => {
    function mulberry32(a: number) {
      return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const seedBase = Math.floor(width * 31 + height * 17 + (effectiveIntensity === 'high' ? 3 : effectiveIntensity === 'medium' ? 2 : 1));
    const rand = mulberry32(seedBase);
    return Array.from({ length: sparklesCount }).map(() => {
      const rr = r3 * (0.4 + rand() * 0.6);
      const ang = rand() * 360;
      const size = 2 + rand() * 2;
      const duration = 2 + rand() * 2;
      const delay = rand() * 2;
      return { rr, ang, size, duration, delay };
    });
  }, [width, height, r3, sparklesCount, effectiveIntensity]);
  return { sparkleData };
}

export function useResolvedLayerNames(t: (k: string) => string, layerNames?: [string, string, string]) {
  return useMemo<[string, string, string]>(() => {
    // Default: leer, damit Labels standardmäßig nicht gerendert werden
    const defaults: [string, string, string] = ['', '', ''];
    if (layerNames && layerNames.length === 3) return layerNames;
    return defaults;
  }, [layerNames]);
}
