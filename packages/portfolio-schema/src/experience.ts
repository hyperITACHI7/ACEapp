import { z } from "zod";

export const ExperienceSchema = z.object({
  role: z.string(),
  org: z.string(),
  dates: z.string().default(""),
  description: z.string().default(""),
  source: z.literal("manual"),
  // Additive — short tag chips shown by some experience widget styles.
  tags: z.array(z.string()).default([]),
});

export type Experience = z.infer<typeof ExperienceSchema>;
