import React, { useMemo, useRef, useState, useEffect, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '~/utils/i18n';

import { Rings } from './Rings';
import { CenterHalo } from './CenterHalo';
import { Sparkles } from './Sparkles';
import { Guides } from './Guides';
import { Defs } from './Defs';
import { FallingItems } from './FallingItems';
import { Labels } from './Labels';
import { OverlayToolCard, type SelectedState } from './OverlayToolCard';

import { svgToClient } from './utils';
import { useRingBuckets, useAnimationsEnabled, useEffectiveIntensity, useSparkles, useResolvedLayerNames, useRadii } from './hooks';
import type { LayerItem, SystemLayersVisualProps } from './types';

const defaultItems: LayerItem[] = [
  { id: 'agent-1', toLayer: 1, color: '#22d3ee', delay: 0.05, emoji: '🤖', size: 10 },
  { id: 'agent-2', toLayer: 1, color: '#60a5fa', delay: 0.25, emoji: '🧠', size: 10 },
  { id: 'tool-1', toLayer: 2, color: '#34d399', delay: 0.35, emoji: '🛠️', size: 10 },
  { id: 'tool-2', toLayer: 2, color: '#60a5fa', delay: 0.55, emoji: '⚙️', size: 10 },
  { id: 'svc-1', toLayer: 3, color: '#f59e0b', delay: 0.75, emoji: '☁️', size: 10 },
  { id: 'svc-2', toLayer: 3, color: '#f472b6', delay: 0.95, emoji: '🔗', size: 10 },
];

export const SystemLayersVisual: React.FC<SystemLayersVisualProps> = ({
  className,
  width = 720,
  height = 360,
  ringColors = ['#4f46e5', '#059669', '#60a5fa'],
  items = defaultItems,
  orbitSpeed = 24,
  layerNames,
  fontFamily = "ui-sans-serif, system-ui, -apple-system, 'SF Pro Display', 'Inter', 'Helvetica Neue', Arial",
  labelMode = 'arc',
  labelSize = 13,
  labelWeight = 600,
  labelColor = '#e5e7eb',
  arcSide = 'top',
  arcOffsetDeg = 0,
  labelArcOffsetPx = 0,
  ariaLabel,
  active = true,
  intensity = 'medium',
  testId,
}) => {
  const t = useT();
  const prefersReduced = useReducedMotion() ?? false;

  const cx = width / 2;
  const cy = height / 2;

  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedState>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { r1, r2, r3, radii } = useRadii(width, height);
  const ringBuckets = useRingBuckets(items);

  const { animationsEnabled, durationFall, durationSnap, ringRotateDur } = useAnimationsEnabled(active, !!prefersReduced);
  const effectiveIntensity = useEffectiveIntensity(width, intensity);
  const { sparkleData } = useSparkles(width, height, r3, effectiveIntensity);

  // Derived factors for calmer animations on mobile/lower intensity
  const intensitySpeedFactor = effectiveIntensity === 'high' ? 1 : effectiveIntensity === 'medium' ? 0.85 : 0.7;
  const mobileFactor = width < 560 ? 0.85 : 1;
  const orbitSpeedEff = animationsEnabled ? Math.max(1, Math.round(orbitSpeed * intensitySpeedFactor * mobileFactor)) : 0;

  // Stable prefix for element IDs/filters to avoid collisions when multiple instances are on the page
  const reactId = useId();
  const idPrefix = useMemo(() => `syslayers-${(testId ?? '').toString() || reactId}`, [reactId, testId]);

  const resolvedLayerNames = useResolvedLayerNames(t as any, layerNames);
  const resolvedAria = ariaLabel || (t('landing.system.aria') as any) || 'System Layers Visualization';

  return (
    <div className={`${className ?? ''} relative`} ref={containerRef}>
      <svg
        ref={svgRef}
        className="block"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={resolvedAria}
        data-testid={testId}
        style={{ fontFamily, willChange: 'transform, opacity' }}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setMouse(null)}
      >
        <desc>{(t('landing.system.ariaDesc') as any) || 'Three concentric rings representing Business AI, Agents, and Multi-Agent System.'}</desc>

        <Defs ringColors={ringColors} mouse={mouse} r3={r3} idPrefix={idPrefix} />

        {/* Guides for paths and arc labels */}
        <Guides
          cx={cx}
          cy={cy}
          radii={[r1, r2, r3]}
          width={width}
          height={height}
          arcSide={arcSide}
          arcOffsetDeg={arcOffsetDeg}
          labelArcOffsetPx={labelArcOffsetPx}
          labelSize={labelSize}
          idPrefix={idPrefix}
        />

        {/* Animated/static rings */}
        <Rings cx={cx} cy={cy} radii={[r1, r2, r3]} ringColors={ringColors} animationsEnabled={animationsEnabled} ringRotateDur={ringRotateDur * (effectiveIntensity === 'high' ? 1 : effectiveIntensity === 'medium' ? 1.15 : 1.35) * (width < 560 ? 1.1 : 1)} />

        {/* Center halo and label */}
        <CenterHalo cx={cx} cy={cy} r={r1} animationsEnabled={animationsEnabled} idPrefix={idPrefix} />

        {/* Sparkles */}
        <Sparkles cx={cx} cy={cy} r3={r3} sparkleData={sparkleData} animationsEnabled={animationsEnabled} intensity={effectiveIntensity} idPrefix={idPrefix} />

        {/* Falling + orbiting items */}
        <FallingItems
          cx={cx}
          cy={cy}
          radii={[r1, r2, r3]}
          r3={r3}
          ringBuckets={ringBuckets}
          orbitSpeed={orbitSpeedEff}
          animationsEnabled={animationsEnabled}
          durationFall={durationFall}
          durationSnap={durationSnap}
          prefersReduced={!!prefersReduced}
          mouse={mouse}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          setSelected={setSelected}
          idPrefix={idPrefix}
        />

        {/* Labels */}
        <Labels
          cx={cx}
          cy={cy}
          r3={r3}
          ringColors={ringColors}
          labelMode={labelMode}
          labelColor={labelColor}
          labelSize={labelSize}
          labelWeight={labelWeight}
          resolvedLayerNames={resolvedLayerNames}
          idPrefix={idPrefix}
        />
      </svg>

      <OverlayToolCard
        selected={selected}
        toClient={(p) => svgToClient(containerRef.current, width, height, p)}
        subtitle={(t('landing.metaphor.tool.subtitle') as any) || 'Interaktion & Aktionen'}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default SystemLayersVisual;
export type { LayerItem, SystemLayersVisualProps };
