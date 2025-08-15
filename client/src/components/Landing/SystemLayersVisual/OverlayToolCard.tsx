import React from 'react';
import ToolCard from '@/components/Landing/ToolCard';

export type SelectedState = {
  id: string;
  title: string;
  emoji?: string;
  color?: string;
  svgX: number;
  svgY: number;
} | null;

type OverlayToolCardProps = {
  selected: SelectedState;
  toClient: (p: { x: number; y: number }) => { left: number; top: number };
  subtitle: string;
  onClose: () => void;
};

export const OverlayToolCard: React.FC<OverlayToolCardProps> = ({ selected, toClient, subtitle, onClose }) => {
  if (!selected) return null;
  const pos = toClient({ x: selected.svgX, y: selected.svgY });
  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, calc(-100% - 12px))' }}
    >
      <ToolCard
        show={true}
        title={selected.title}
        subtitle={subtitle}
        emoji={selected.emoji}
        color={selected.color}
        onClose={onClose}
        className="pointer-events-auto"
      />
    </div>
  );
};

export default OverlayToolCard;
