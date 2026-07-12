import { listThemes, DEFAULT_THEME_ID, type ThemeModule } from "@portfolio/themes";

export interface OnboardingAnswers {
  role?: string;
  domain?: string;
  goal?: string;
}

/**
 * Falls back to the default (free) theme when nothing matches — onboarding must never block
 * on a missing domain match (edge_case.md §1).
 */
export function recommendThemes(answers: OnboardingAnswers): ThemeModule[] {
  const domain = (answers.domain ?? "").toLowerCase().trim();
  if (!domain) return [listThemes().find((t) => t.manifest.id === DEFAULT_THEME_ID)!];

  const matches = listThemes().filter((theme) =>
    theme.manifest.domainTags.some((tag) => domain.includes(tag) || tag.includes(domain))
  );
  if (matches.length > 0) return matches;

  const fallback = listThemes().find((t) => t.manifest.id === DEFAULT_THEME_ID);
  return fallback ? [fallback] : [listThemes()[0]];
}
