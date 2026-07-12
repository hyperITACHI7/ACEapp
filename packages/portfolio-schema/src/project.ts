import { z } from "zod";

// `editedFields` and `sourceUnavailable` are additive fields (beyond the spec's literal
// PortfolioData shape) required to satisfy edge_case.md: a scheduled GitHub re-sync must never
// clobber a field the user manually edited, and a pinned repo that disappears/goes private must
// be flagged rather than silently producing a dead link on the public page.
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(""),
  images: z.array(z.string().url()).default([]),
  links: z.array(z.string().url()).default([]),
  source: z.enum(["manual", "github"]),
  githubRepoId: z.number().optional(),
  editedFields: z.array(z.string()).default([]),
  sourceUnavailable: z.boolean().default(false),
  // Additive — short category/tag chips shown by some gallery widget styles. Backward-compatible
  // via `.default()`, no schema version bump needed for existing rows that predate it.
  tags: z.array(z.string()).default([]),
  // Additive — free-text date/year shown by gallery widgets, editable manually or imported from
  // GitHub's `created_at`. Free text (not a parsed date type) to match the `Experience.dates`
  // precedent — no format validation, no schema version bump.
  date: z.string().default(""),
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Marks a field as manually edited so a scheduled GitHub re-sync never clobbers it
 * (edge_case.md — re-sync only overwrites fields the user hasn't touched).
 */
export function markEdited(project: Project, field: string): Project {
  return project.editedFields.includes(field)
    ? project
    : { ...project, editedFields: [...project.editedFields, field] };
}

/** Applies a patch to a project, marking `editedField` when the project came from GitHub. */
export function updateProjectField(project: Project, patch: Partial<Project>, editedField?: string): Project {
  const updated = { ...project, ...patch };
  return editedField && project.source === "github" ? markEdited(updated, editedField) : updated;
}

export function createManualProject(): Project {
  return {
    id: crypto.randomUUID(),
    title: "New project",
    description: "",
    images: [],
    links: [],
    source: "manual",
    editedFields: [],
    sourceUnavailable: false,
    tags: [],
    date: "",
  };
}
