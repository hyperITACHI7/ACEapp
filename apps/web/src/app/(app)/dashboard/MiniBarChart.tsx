interface MiniBarChartProps {
  values: number[];
  width?: number;
  height?: number;
}

/** Minimalist bar chart — each bar a different shade of gray (lighter = more recent), no axes. */
export function MiniBarChart({ values, width = 200, height = 48 }: MiniBarChartProps) {
  if (values.length === 0) return null;

  const max = Math.max(...values, 1);
  const gap = 2;
  const barWidth = Math.max(width / values.length - gap, 1);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {values.map((v, i) => {
        const barHeight = Math.max((v / max) * height, 2);
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        const shade = 0.25 + (i / Math.max(values.length - 1, 1)) * 0.55;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={1}
            fill={`rgba(255,255,255,${shade.toFixed(2)})`}
          />
        );
      })}
    </svg>
  );
}
