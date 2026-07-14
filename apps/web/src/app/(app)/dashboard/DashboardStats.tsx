"use client";

import Link from "next/link";
import { Card, HealthScoreRing, useToast } from "@portfolio/ui-kit";
import type { HealthStatus } from "@/lib/healthScore";
import { Sparkline } from "./Sparkline";
import { MiniBarChart } from "./MiniBarChart";

interface DashboardStatsProps {
  todayViews: number;
  changePct: number | null;
  hourlyViews: number[];
  hourlyUniqueVisitors: number[];
  todayUniqueVisitors: number;
  healthScore: number;
  healthStatus: HealthStatus;
  username: string;
}

const TONE_CLASS: Record<HealthStatus["tone"], string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function DashboardStats({
  todayViews,
  changePct,
  hourlyViews,
  hourlyUniqueVisitors,
  todayUniqueVisitors,
  healthScore,
  healthStatus,
  username,
}: DashboardStatsProps) {
  const { showToast } = useToast();

  async function share() {
    const url = `${window.location.origin}/${username}`;
    await navigator.clipboard.writeText(url);
    showToast("Link copied!", "success");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col gap-2 bg-panel backdrop-blur-none">
          <div className="flex items-start justify-between">
            <span className="text-xs text-muted-foreground">Total Views (Today)</span>
            {changePct !== null && (
              <span
                className={`text-xs font-medium ${changePct >= 0 ? "text-success" : "text-destructive"}`}
              >
                {changePct >= 0 ? "+" : ""}
                {changePct}%
              </span>
            )}
          </div>
          <div className="text-3xl font-extrabold">{todayViews}</div>
          <Sparkline values={hourlyViews} />
        </Card>

        <Card className="flex flex-col gap-2 bg-panel backdrop-blur-none">
          <span className="text-xs text-muted-foreground">Unique Visitors (Today)</span>
          <div className="text-3xl font-extrabold">{todayUniqueVisitors}</div>
          <MiniBarChart values={hourlyUniqueVisitors} />
        </Card>

        <Card className="flex flex-col gap-2 bg-panel backdrop-blur-none">
          <span className="text-xs text-muted-foreground">Portfolio Health</span>
          <div className="flex-1 grid grid-cols-2 items-center">
            <div className={`text-sm font-semibold text-center ${TONE_CLASS[healthStatus.tone]}`}>
              {healthStatus.label}
            </div>
            <div className="flex justify-center">
              <HealthScoreRing value={healthScore} size={104} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href={`/${username}`}
          target="_blank"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View portfolio
        </Link>
        <button onClick={share} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Share portfolio
        </button>
      </div>
    </div>
  );
}
