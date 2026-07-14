interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

/** Minimalist single-line "thread" chart — no axes/labels/gridlines, just the trend. */
export function Sparkline({ values, width = 200, height = 48 }: SparklineProps) {
  if (values.length === 0) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * height,
  }));

  // Quadratic-bezier-through-midpoints: curves through the midpoint of each consecutive pair
  // using the actual data point as the control point, so the line has no sharp corners at any
  // point — reads as a smooth thread rather than a jagged polyline.
  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    path += ` Q ${curr.x.toFixed(1)},${curr.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  path += ` T ${last.x.toFixed(1)},${last.y.toFixed(1)}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
      <path
        d={path}
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
