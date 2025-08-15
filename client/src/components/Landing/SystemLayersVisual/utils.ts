// Shared utilities for SystemLayersVisual

export function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
}

export function svgToClient(
  container: HTMLDivElement | null,
  width: number,
  height: number,
  p: { x: number; y: number }
) {
  if (!container) return { left: p.x, top: p.y };
  const rect = container.getBoundingClientRect();
  const left = (p.x / width) * rect.width;
  const top = (p.y / height) * rect.height;
  return { left, top };
}

// Smooth bezier from center (cx,cy) to target (tx,ty)
export function chordPath(
  cx: number,
  cy: number,
  tx: number,
  ty: number,
  curve = 0.18
) {
  const dx = tx - cx;
  const dy = ty - cy;
  const L = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / L;
  const uy = dy / L;
  const nx = -uy;
  const ny = ux;
  const k = L * curve;
  const c1x = cx + dx * 0.35 + nx * k;
  const c1y = cy + dy * 0.35 + ny * k;
  const c2x = cx + dx * 0.65 + nx * k;
  const c2y = cy + dy * 0.65 + ny * k;
  return `M ${cx},${cy} C ${c1x},${c1y} ${c2x},${c2y} ${tx},${ty}`;
}
