import type { PortfolioData } from "@portfolio/schema";

export interface HealthTip {
  label: string;
  points: number;
}

export interface HealthScoreResult {
  score: number;
  tips: HealthTip[];
}

/**
 * Additive, per-field scoring — every check is independent so partial completeness always
 * yields partial credit and a specific tip, never an all-or-nothing gate (edge_case.md §6).
 */
export function computeHealthScore(data: PortfolioData): HealthScoreResult {
  const checks: Array<{ ok: boolean; points: number; tip: string }> = [
    { ok: Boolean(data.profile.name.trim()), points: 10, tip: "Add your name" },
    { ok: Boolean(data.profile.headline.trim()), points: 10, tip: "Add a headline" },
    { ok: data.profile.bio.trim().length >= 40, points: 15, tip: "Write a bio (40+ characters)" },
    { ok: Boolean(data.profile.photoUrl), points: 10, tip: "Add a profile photo" },
    { ok: data.projects.length >= 1, points: 15, tip: "Add at least one project" },
    { ok: data.projects.length >= 3, points: 10, tip: "Add 3+ projects for a fuller portfolio" },
    { ok: data.experience.length >= 1, points: 10, tip: "Add a work experience entry" },
    { ok: data.skills.length >= 3, points: 10, tip: "Add 3+ skills" },
    {
      ok: data.widgets.some((w) => w.visible && w.key !== "about"),
      points: 10,
      tip: "Enable at least one widget beyond About",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.ok ? c.points : 0), 0);
  const tips = checks.filter((c) => !c.ok).map((c) => ({ label: c.tip, points: c.points }));

  return { score: Math.min(100, score), tips };
}
