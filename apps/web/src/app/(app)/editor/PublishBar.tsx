"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioData } from "@portfolio/schema";
import { Button, useToast } from "@portfolio/ui-kit";
import { computeHealthScore } from "@/lib/healthScore";

interface PublishBarProps {
  portfolioId: string;
  draft: PortfolioData;
  published: boolean;
  saving: boolean;
}

export function PublishBar({ portfolioId, draft, published, saving }: PublishBarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [dismissedNudge, setDismissedNudge] = useState(false);

  const { score, tips } = computeHealthScore(draft);

  async function publish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/publish`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        showToast(body.error ?? "Publish failed.", "error");
        return;
      }
      showToast("Published!", "success");
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2 min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <strong className="text-sm shrink-0">Portfolio health: {score}%</strong>
        <div className="h-1.5 flex-1 max-w-40 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{saving ? "Saving…" : "Saved"}</span>
        <Button onClick={publish} disabled={publishing} size="sm" className="ml-auto shrink-0">
          {publishing ? "Publishing…" : published ? "Republish" : "Publish"}
        </Button>
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
