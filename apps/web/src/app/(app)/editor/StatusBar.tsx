"use client";

import { useState } from "react";
import type { PortfolioData } from "@portfolio/schema";
import { computeHealthScore } from "@/lib/healthScore";

interface StatusBarProps {
  draft: PortfolioData;
  saving: boolean;
}

/** Health score + save indicator + improvement tips. All the header CONTROLS (device toggle,
 *  Preview, theme, Publish) live in TopBar as direct flex siblings so they share one vertical
 *  center line — anything placed inside this block rides up whenever the tips row appears. */
export function StatusBar({ draft, saving }: StatusBarProps) {
  const [dismissedNudge, setDismissedNudge] = useState(false);

  const { score, tips } = computeHealthScore(draft);

  return (
    <div className="flex flex-1 flex-col gap-2 min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <strong className="text-sm shrink-0">Portfolio health: {score}%</strong>
        <div className="h-1.5 flex-1 max-w-40 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{saving ? "Saving…" : "Saved"}</span>
      </div>
      {/* Publishing is never blocked by these gaps — this is a nudge, not a gate (edge_case.md §3). */}
      {tips.length > 0 && !dismissedNudge && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          {tips.slice(0, 3).map((tip) => (
            <span key={tip.label} className="rounded-full border border-white/10 px-2 py-0.5">
              {tip.label}
            </span>
          ))}
          <button onClick={() => setDismissedNudge(true)} className="hover:text-foreground transition-colors">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
