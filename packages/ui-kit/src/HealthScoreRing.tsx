export interface HealthScoreRingProps {
  value: number;
  size?: number;
}

/** Circular progress ring for a portfolio's health score — ported from the Aether design
 *  reference (track + animated arc + centered percentage), driven by whatever score
 *  `computeHealthScore` (apps/web/src/lib/healthScore.ts) already produces. Inline styles for the
 *  SVG stroke colors since this lives outside apps/web's own Tailwind-scanned source tree (see
 *  Dialog.tsx for the same constraint) — `stroke="currentColor"` on the arc lets it inherit
 *  `text-foreground`/`--accent` from a wrapping className instead of hardcoding a color here. */
export function HealthScoreRing({ value, size = 88 }: HealthScoreRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#262626" strokeWidth={8} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-foreground"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span
        className="absolute font-sans font-bold text-foreground"
        style={{ fontSize: size / 4 }}
      >
        {value}
      </span>
    </div>
  );
}
