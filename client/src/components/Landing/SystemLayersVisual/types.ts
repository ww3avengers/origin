// Shared types for SystemLayersVisual

export type LayerItem = {
  id: string;
  label?: string;
  color?: string;
  toLayer: 1 | 2 | 3; // target ring index (inner=1..outer=3)
  delay?: number;
  emoji?: string; // lightweight icon fallback
  size?: number; // px radius of badge
};

export type SystemLayersVisualProps = {
  className?: string;
  width?: number;
  height?: number;
  ringColors?: [string, string, string];
  items?: LayerItem[];
  orbitSpeed?: number; // degrees per second
  layerNames?: [string, string, string]; // custom labels
  fontFamily?: string; // typography control
  labelMode?: 'arc' | 'column' | 'arc-vertical' | 'right-column';
  labelSize?: number;
  labelWeight?: number;
  labelColor?: string;
  arcSide?: 'top' | 'bottom';
  arcOffsetDeg?: number; // positive: clockwise shift of arc
  labelArcOffsetPx?: number; // positive: place labels slightly outside the ring
  ariaLabel?: string; // a11y: localized label for the visualization
  active?: boolean; // viewport controlled animations
  intensity?: 'low' | 'medium' | 'high';
  testId?: string; // for tests
};
