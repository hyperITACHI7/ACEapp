import { Card } from "@portfolio/ui-kit";
import type { HealthTip } from "@/lib/healthScore";

interface ActionableTipsProps {
  tips: HealthTip[];
  hasPublishedPortfolio: boolean;
}

/** Tall vertical card of health-score tips, most-impactful (highest point value) first. */
export function ActionableTips({ tips, hasPublishedPortfolio }: ActionableTipsProps) {
  const sorted = [...tips].sort((a, b) => b.points - a.points);

  return (
    <Card className="flex flex-col gap-4 h-full bg-panel backdrop-blur-none">
      <h3 className="text-base font-semibold">Actionable tips</h3>
      {!hasPublishedPortfolio ? (
        <p className="text-sm text-muted-foreground">
          Publish a portfolio to get personalized tips for improving its health score.
        </p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your published portfolio is fully optimized — nice work.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((tip) => (
            <div key={tip.label} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1">
              <span className="text-xs font-semibold text-success">+{tip.points} pts</span>
              <span className="text-sm font-medium">{tip.label}</span>
              <span className="text-xs text-muted-foreground">{tip.description}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
