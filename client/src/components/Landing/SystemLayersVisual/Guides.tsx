import React from 'react';

type GuidesProps = {
  cx: number;
  cy: number;
  radii: [number, number, number];
  width: number;
  height: number;
  arcSide: 'top' | 'bottom';
  arcOffsetDeg: number;
  labelArcOffsetPx: number;
  labelSize: number;
  idPrefix: string;
};

export const Guides: React.FC<GuidesProps> = ({ cx, cy, radii: [r1, r2, r3], width, height, arcSide, arcOffsetDeg, labelArcOffsetPx, labelSize, idPrefix }) => {
  return (
    <>
      {[r1, r2, r3].map((r, idx) => (
        <g key={idx} aria-hidden="true">
          <path
            id={`${idPrefix}-ringPath${idx}`}
            d={`M ${cx - r},${cy} a ${r},${r} 0 1,1 ${2 * r},0 a ${r},${r} 0 1,1 -${2 * r},0`}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          {(() => {
            const degToRad = (a: number) => (a * Math.PI) / 180;
            const [baseStart, baseEnd] = arcSide === 'bottom' ? [110, 250] : [-70, 70];
            const startDeg = baseStart + arcOffsetDeg;
            const endDeg = baseEnd + arcOffsetDeg;
            const startA = degToRad(startDeg);
            const endA = degToRad(endDeg);
            const viewHalfMin = Math.min(width, height) / 2;
            const extraTextMargin = Math.max(6, labelSize * 0.8);
            const maxRR = viewHalfMin - 2 - extraTextMargin;
            const rr = Math.min(r + labelArcOffsetPx, maxRR);
            const x1 = cx + rr * Math.cos(startA);
            const y1 = cy + rr * Math.sin(startA);
            const x2 = cx + rr * Math.cos(endA);
            const y2 = cy + rr * Math.sin(endA);
            const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
            const d = `M ${x1},${y1} A ${rr},${rr} 0 ${largeArc} 1 ${x2},${y2}`;
            return <path id={`${idPrefix}-labelArc${idx}`} d={d} fill="none" />;
          })()}
        </g>
      ))}
    </>
  );
};

export default Guides;
