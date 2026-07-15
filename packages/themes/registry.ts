import type { ThemeModule } from "./types";
import developerMinimal from "./developer-minimal";
import photographerGrid from "./photographer-grid";
import architectShowcase from "./architect-showcase";
import writerEditorial from "./writer-editorial";
import multiDomainCards from "./multi-domain-cards";
import animatedMotion from "./animated-motion";
import coutureEditorial from "./couture-editorial";

const registry = new Map<string, ThemeModule>();

function register(mod: ThemeModule) {
  if (registry.has(mod.manifest.id)) {
    // Fails the build/deploy (via `npm run validate:registries`), never a runtime surprise
    // for a real user landing on a duplicate-id theme.
    throw new Error(
      `Duplicate theme id "${mod.manifest.id}" registered in packages/themes/registry.ts`
    );
  }
  registry.set(mod.manifest.id, mod);
}

register(developerMinimal);
register(photographerGrid);
register(architectShowcase);
register(writerEditorial);
register(multiDomainCards);
register(animatedMotion);
register(coutureEditorial);

export const DEFAULT_THEME_ID = "developer-minimal";

export function getTheme(id: string): ThemeModule | undefined {
  return registry.get(id);
}

export function listThemes(): ThemeModule[] {
  return [...registry.values()];
}

export type { ThemeManifest, ThemeModule, ThemeProps, ThemeSlot, TemplateBlueprint } from "./types";
export { applyBlueprint } from "./blueprint";
