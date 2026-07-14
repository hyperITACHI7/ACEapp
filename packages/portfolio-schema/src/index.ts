import { z } from "zod";
import { ProfileSchema } from "./profile";
import { WidgetInstanceSchema, NavGroupSchema } from "./widget";
import { ProjectSchema } from "./project";
import { ExperienceSchema } from "./experience";
import { GithubIntegrationSchema } from "./github";

export const SCHEMA_VERSION = 1 as const;

export * from "./profile";
export * from "./widget";
export * from "./project";
export * from "./experience";
export * from "./github";

export const PortfolioDataSchema = z.object({
  profile: ProfileSchema,
  themeId: z.string(),
  palette: z.string(),
  widgets: z.array(WidgetInstanceSchema).default([]),
  // Absent (not `[]` via `.default()`) is deliberately meaningful, same convention as
  // `WidgetInstance.grid` — it distinguishes "never initialized, seed sensible defaults from
  // current widgets" from "user intentionally has zero nav sections" (see
  // `seedDefaultNavGroups` in the editor's sectionOps.ts).
  navGroups: z.array(NavGroupSchema).optional(),
  projects: z.array(ProjectSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  skills: z.array(z.string()).default([]),
  integrations: z
    .object({
      github: GithubIntegrationSchema.optional(),
    })
    .default({}),
  meta: z.object({
    published: z.boolean().default(false),
    publishedAt: z.string().datetime().nullable().default(null),
    updatedAt: z.string().datetime(),
    schemaVersion: z.literal(1).default(1),
  }),
});

export type PortfolioData = z.infer<typeof PortfolioDataSchema>;

export type ValidationResult =
  | { success: true; data: PortfolioData }
  | { success: false; error: z.ZodError };

/**
 * Every write path (draft PATCH, publish, GitHub import) and every read path (public render)
 * must go through this — the draft/published columns must never hold data the schema itself
 * would reject (edge_case.md §8/§9: corrupted records fall back rather than crash).
 */
export function validatePortfolioData(input: unknown): ValidationResult {
  const result = PortfolioDataSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error };
}

export function emptyPortfolioData(themeId: string, palette: string): PortfolioData {
  const now = new Date().toISOString();
  return {
    profile: {
      name: "",
      headline: "",
      bio: "",
      photoUrl: null,
      domain: "",
      location: "",
      socialLinks: [],
    },
    themeId,
    palette,
    widgets: [],
    projects: [],
    experience: [],
    skills: [],
    integrations: {},
    meta: {
      published: false,
      publishedAt: null,
      updatedAt: now,
      schemaVersion: SCHEMA_VERSION,
    },
  };
}
