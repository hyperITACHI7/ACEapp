import type { PortfolioData } from "@portfolio/schema";

export interface HealthTip {
  label: string;
  description: string;
  points: number;
}

export interface HealthScoreResult {
  score: number;
  tips: HealthTip[];
}

export type HealthTone = "success" | "warning" | "destructive";

export interface HealthStatus {
  label: string;
  tone: HealthTone;
}

/** Qualitative band for the raw 0-100 score, driving the dashboard's colored status text. */
export function getHealthStatus(score: number): HealthStatus {
  if (score >= 80) return { label: "Optimal", tone: "success" };
  if (score >= 50) return { label: "Needs Work", tone: "warning" };
  return { label: "Needs Attention", tone: "destructive" };
}

/**
 * Additive, per-field scoring — every check is independent so partial completeness always
 * yields partial credit and a specific tip, never an all-or-nothing gate (edge_case.md §6).
 */
export function computeHealthScore(data: PortfolioData): HealthScoreResult {
  const checks: Array<{ ok: boolean; points: number; tip: string; description: string }> = [
    {
      ok: Boolean(data.profile.name.trim()),
      points: 10,
      tip: "Add your name",
      description: "Your name is one of the first things a visitor looks for — an empty name reads as unfinished.",
    },
    {
      ok: Boolean(data.profile.headline.trim()),
      points: 10,
      tip: "Add a headline",
      description: "A short headline under your name tells visitors what you do at a glance.",
    },
    {
      ok: data.profile.bio.trim().length >= 40,
      points: 15,
      tip: "Write a bio (40+ characters)",
      description: "A real bio gives recruiters context beyond a job title — even two sentences helps a lot.",
    },
    {
      ok: Boolean(data.profile.photoUrl),
      points: 10,
      tip: "Add a profile photo",
      description: "Portfolios with a photo feel more trustworthy and personal than a blank avatar.",
    },
    {
      ok: data.projects.length >= 1,
      points: 15,
      tip: "Add at least one project",
      description: "Projects are the core of a portfolio — without one there's nothing to actually showcase.",
    },
    {
      ok: data.projects.length >= 3,
      points: 10,
      tip: "Add 3+ projects for a fuller portfolio",
      description: "A single project can look like a fluke — three or more shows range and consistency.",
    },
    {
      ok: data.experience.length >= 1,
      points: 10,
      tip: "Add a work experience entry",
      description: "Work history gives visitors a timeline of your growth, not just finished output.",
    },
    {
      ok: data.skills.length >= 3,
      points: 10,
      tip: "Add 3+ skills",
      description: "Listed skills help recruiters quickly match you against what they're looking for.",
    },
    {
      ok: data.widgets.some((w) => w.visible && w.key !== "about"),
      points: 10,
      tip: "Enable at least one widget beyond About",
      description: "A portfolio that's only an About section feels thin — enable at least one more section.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.ok ? c.points : 0), 0);
  const tips = checks
    .filter((c) => !c.ok)
    .map((c) => ({ label: c.tip, description: c.description, points: c.points }));

  return { score: Math.min(100, score), tips };
}
