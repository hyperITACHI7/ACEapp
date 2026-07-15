import { emptyPortfolioData, type PortfolioData } from "@portfolio/schema";
import type { TemplateBlueprint } from "./types";

/**
 * Builds a portfolio's starting data for a theme. When the theme ships a `blueprint`, its
 * widgets/navGroups/profile/projects/experience/skills are deep-merged over
 * `emptyPortfolioData(themeId, palette)` (blueprint content wins over the empty defaults; `meta`
 * always comes from `emptyPortfolioData` — a blueprint never dictates publish state or
 * timestamps). Absent blueprint = today's behavior, unchanged: a bare empty portfolio.
 *
 * The caller is still responsible for running the result through `validatePortfolioData` before
 * persisting — a blueprint that fails schema validation is an authoring bug that must fail loudly
 * at development time, not be silently patched here.
 */
export function applyBlueprint(
  themeId: string,
  defaultPalette: string,
  blueprint: TemplateBlueprint | undefined
): PortfolioData {
  const base = emptyPortfolioData(themeId, blueprint?.palette ?? defaultPalette);
  if (!blueprint) return base;

  return {
    ...base,
    widgets: blueprint.widgets.map((w) => ({
      key: w.key,
      order: w.order,
      visible: w.visible,
      config: w.config,
      ...(w.grid ? { grid: w.grid } : {}),
      ...(w.groupId ? { groupId: w.groupId } : {}),
    })),
    navGroups: blueprint.navGroups,
    profile: { ...base.profile, ...blueprint.profile },
    projects: blueprint.projects ?? base.projects,
    experience: blueprint.experience ?? base.experience,
    skills: blueprint.skills ?? base.skills,
  };
}
