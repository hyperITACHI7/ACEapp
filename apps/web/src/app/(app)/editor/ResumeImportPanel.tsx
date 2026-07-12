"use client";

import { useState } from "react";
import type { PortfolioData } from "@portfolio/schema";
import { useToast } from "@portfolio/ui-kit";

interface ResumeImportPanelProps {
  draft: PortfolioData;
  updateDraft: (updater: (prev: PortfolioData) => PortfolioData) => void;
}

interface ParsedExperience {
  role: string;
  org: string;
  dates?: string;
  description?: string;
}

interface ParsedResumeFields {
  name?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  experience?: ParsedExperience[];
}

/**
 * Lets a user (re-)import a resume at any point, not just during onboarding. Unlike onboarding
 * (a blank quiz form with nothing to protect), this merges non-destructively into whatever the
 * user has already filled in: existing name/headline/bio are never overwritten, skills/experience
 * are appended rather than replaced. Skipped/appended counts are reported so the merge isn't a
 * silent no-op from the user's perspective.
 */
export function ResumeImportPanel({ draft, updateDraft }: ResumeImportPanelProps) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Couldn't read this as a resume.");
        return;
      }
      const fields: ParsedResumeFields = body.fields ?? {};
      const filledFields: string[] = [];
      let addedSkills = 0;
      let addedExperience = 0;

      updateDraft((prev) => {
        const profile = { ...prev.profile };
        if (fields.name && !profile.name.trim()) {
          profile.name = fields.name;
          filledFields.push("name");
        }
        if (fields.headline && !profile.headline.trim()) {
          profile.headline = fields.headline;
          filledFields.push("headline");
        }
        if (fields.bio && !profile.bio.trim()) {
          profile.bio = fields.bio;
          filledFields.push("bio");
        }

        const existingSkills = new Set(prev.skills.map((s) => s.toLowerCase()));
        const newSkills = (fields.skills ?? []).filter((s) => s.trim() && !existingSkills.has(s.toLowerCase()));
        addedSkills = newSkills.length;

        const newExperience = (fields.experience ?? []).map((e) => ({
          role: e.role || "Role",
          org: e.org || "",
          dates: e.dates ?? "",
          description: e.description ?? "",
          source: "manual" as const,
          tags: [],
        }));
        addedExperience = newExperience.length;

        return {
          ...prev,
          profile,
          skills: [...prev.skills, ...newSkills],
          experience: [...prev.experience, ...newExperience],
        };
      });

      const summary: string[] = [];
      if (filledFields.length) summary.push(`filled ${filledFields.join(", ")}`);
      if (addedSkills) summary.push(`added ${addedSkills} skill${addedSkills === 1 ? "" : "s"}`);
      if (addedExperience) summary.push(`added ${addedExperience} experience entr${addedExperience === 1 ? "y" : "ies"}`);
      showToast(summary.length ? `Resume imported — ${summary.join(", ")}.` : "Resume imported — nothing new to add.", "success");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Upload a PDF resume to fill in empty fields and add new skills/experience. Anything you&apos;ve
        already entered is left untouched.
      </p>
      <input
        type="file"
        accept="application/pdf"
        disabled={uploading}
        className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-foreground file:text-sm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      {uploading && <p className="text-xs text-muted-foreground">Parsing resume…</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
