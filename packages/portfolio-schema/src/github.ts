import { z } from "zod";

export const GithubIntegrationStatusSchema = z.enum([
  "connected",
  "rate_limited",
  "reconnect_required",
  "disconnected",
]);

export const GithubIntegrationSchema = z.object({
  username: z.string(),
  connectedAt: z.string().datetime(),
  lastSyncedAt: z.string().datetime().nullable().default(null),
  status: GithubIntegrationStatusSchema,
});

export type GithubIntegration = z.infer<typeof GithubIntegrationSchema>;
