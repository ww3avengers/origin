import React from 'react';

type LabelsProps = {
  cx: number;
  cy: number;
  r3: number;
  ringColors: [string, string, string];
  labelMode: 'arc' | 'column' | 'arc-vertical' | 'right-column';
  labelColor: string;
  labelSize: number;
  labelWeight: number;
  resolvedLayerNames: [string, string, string];
  idPrefix: string;
};

export const Labels: React.FC<LabelsProps> = ({ cx, cy, r3, ringColors, labelMode, labelColor, labelSize, labelWeight, resolvedLayerNames, idPrefix }) => {
  // Hide labels when all provided names are empty
  const hasAnyLabel = resolvedLayerNames.some((n) => (n ?? '').trim().length > 0);
  if (!hasAnyLabel) return null;
  const r1 = r3 * 0.47; // only needed for consistency; actual arcs come from Guides via #labelArc*
  const r2 = r3 * 0.74;
  const radii: [number, number, number] = [r1, r2, r3];

  if (labelMode === 'arc') {
    return (
      <g opacity={0.92} fontSize={labelSize} style={{ letterSpacing: 0.6, fontWeight: labelWeight }} filter={`url(#${idPrefix}-textGlow)`}>
        {radii.map((_, i) => (
          <text key={i} fill={ringColors[i] ?? labelColor}>
            <textPath href={`#${idPrefix}-labelArc${i}`} startOffset="50%" textAnchor="middle">
              {resolvedLayerNames[i]}
            </textPath>
          </text>
        ))}
      </g>
    );
  }

  if (labelMode === 'arc-vertical') {
    return (
      <g opacity={0.95} fill={labelColor} fontSize={labelSize} filter={`url(#${idPrefix}-textGlow)`}>
        {radii.map((_, i) => (
          <text key={i} style={{ writingMode: 'vertical-rl' as any }}>
            <textPath href={`#${idPrefix}-labelArc${i}`} startOffset="50%" textAnchor="middle">
              {resolvedLayerNames[i]}
            </textPath>
          </text>
        ))}
      </g>
    );
  }

  if (labelMode === 'right-column') {
    const x = cx + r3 + 18;
    const spacing = 22;
    const ys = [cy - spacing, cy, cy + spacing];
    return (
      <g opacity={0.96} fill={labelColor} fontSize={labelSize} style={{ fontWeight: labelWeight }} textAnchor="start" filter={`url(#${idPrefix}-textGlow)`}>
        {ys.map((y, i) => (
          <text key={i} x={x} y={y} dominantBaseline="middle">
            {resolvedLayerNames[i]}
          </text>
        ))}
      </g>
    );
  }

  const spacing = 22;
  const ys = [cy - spacing, cy, cy + spacing];
  return (
    <g opacity={0.95} fill={labelColor} fontSize={labelSize} style={{ letterSpacing: 0.5, fontWeight: labelWeight }} textAnchor="middle" filter={`url(#${idPrefix}-textGlow)`}>
      {ys.map((y, i) => (
        <text key={i} x={cx} y={y} dominantBaseline="middle">
          {resolvedLayerNames[i]}
        </text>
      ))}
    </g>
  );
};

export default Labels;
