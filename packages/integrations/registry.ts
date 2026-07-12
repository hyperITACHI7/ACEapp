import { syncPinnedGithubProjects, type SyncResult } from "./github/sync";

export interface IntegrationModule {
  key: string;
  sync: (portfolioId: string) => Promise<SyncResult>;
}

// Only GitHub is implemented for MVP — no Notion/Behance/Figma/LinkedIn entries exist here,
// per MVPphased_architecture.md's explicit out-of-scope list.
const registry = new Map<string, IntegrationModule>([
  ["github", { key: "github", sync: syncPinnedGithubProjects }],
]);

export function getIntegration(key: string): IntegrationModule | undefined {
  return registry.get(key);
}

export function listIntegrations(): IntegrationModule[] {
  return [...registry.values()];
}
