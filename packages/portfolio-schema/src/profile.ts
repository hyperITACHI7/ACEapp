import { z } from "zod";

export const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

export const ProfileSchema = z.object({
  name: z.string().default(""),
  headline: z.string().default(""),
  bio: z.string().default(""),
  photoUrl: z.string().url().nullable().default(null),
  domain: z.string().default(""),
  // Additive field for the Contact widget — backward-compatible via `.default()`, no schema
  // version bump needed for existing rows that predate it.
  location: z.string().default(""),
  socialLinks: z.array(SocialLinkSchema).default([]),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
