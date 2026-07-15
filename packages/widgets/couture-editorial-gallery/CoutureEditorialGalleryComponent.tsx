"use client";

import { useMemo, useState } from "react";
import { EditableText, useEditorMode, useToast } from "@portfolio/ui-kit";
import { createManualProject, resolveGridLayout, updateProjectField, type Project } from "@portfolio/schema";
import type { WidgetProps } from "../types";

function renderHeading(heading: string) {
  const lines = heading.split("\n");
  if (lines.length < 2) return heading;
  return (
    <>
      {lines[0]}
      <br />
      <span className="widget-heading-line--accent">{lines.slice(1).join(" ")}</span>
    </>
  );
}

/** Pulls a 4-digit year out of a free-text `date` field ("Autumn/Winter 2024" -> "2024") for the
 *  year-filter chips — `Project.date` has no dedicated year field, so this is a best-effort
 *  parse; projects whose date has no parseable year always show under "All". */
function yearOf(date: string): string | null {
  const match = date.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : null;
}

/**
 * Size variants (manifest sizes ["2x3","2x2","2x1"]; native = 2x3, the reference's full archive):
 * - h ≥ 3: every project, plus the year-filter chips
 * - h = 2: first 4 projects, no filters
 * - h = 1: compact strip — first 3 projects, no filters, smaller cards (CSS `--strip`)
 * The cap applies on the public page only; while editing, every project stays reachable so
 * nothing silently disappears from the user's editing surface.
 */
export function CoutureEditorialGalleryComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateDraft, uploadImage } = useEditorMode();
  const { showToast } = useToast();
  const [yearFilter, setYearFilter] = useState("All");

  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Design Work";
  const heading = typeof config.heading === "string" ? config.heading : "Collections\nArchive";

  const grid = resolveGridLayout(data.widgets.filter((w) => w.visible), data.navGroups ?? []).find(
    (g) => g.key === instanceKey
  );
  const h = grid?.h ?? 3;
  const strip = h === 1;
  const maxProjects = h >= 3 ? Infinity : h === 2 ? 4 : 3;
  const yearFilterEnabled = config.yearFilterEnabled !== false && h >= 3;

  const projects = editing ? data.projects : data.projects.filter((p) => !p.sourceUnavailable);
  const years = useMemo(() => {
    const found = new Set<string>();
    for (const p of projects) {
      const y = yearOf(p.date);
      if (y) found.add(y);
    }
    return ["All", ...[...found].sort((a, b) => Number(b) - Number(a))];
  }, [projects]);
  const filteredProjects =
    yearFilterEnabled && yearFilter !== "All" ? projects.filter((p) => yearOf(p.date) === yearFilter) : projects;
  // While editing, never hide projects behind the size cap — resizing shouldn't make content
  // unreachable in the editor; the cap is a display-density choice for the rendered page.
  const visibleProjects = editing ? filteredProjects : filteredProjects.slice(0, maxProjects);

  function updateProject(id: string, patch: Partial<Project>, editedField?: string) {
    updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? updateProjectField(p, patch, editedField) : p)),
    }));
  }
  function removeProject(id: string) {
    updateDraft((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  }
  function addProject() {
    updateDraft((prev) => ({ ...prev, projects: [...prev.projects, createManualProject()] }));
  }
  async function handleUploadImage(id: string, file: File) {
    try {
      const url = await uploadImage(file);
      updateProject(id, { images: [url] });
    } catch {
      showToast("Couldn't upload that image. Please retry.", "error");
    }
  }

  return (
    <div className={`widget widget-couture-gallery${strip ? " widget-couture-gallery--strip" : ""}`}>
      <div className="widget-couture-gallery-head">
        <div>
          <span className="widget-eyebrow">{eyebrow}</span>
          <h2 className="widget-heading widget-heading--couture">{renderHeading(heading)}</h2>
        </div>
        {yearFilterEnabled && years.length > 1 && (
          <div className="widget-couture-gallery-filters">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={`widget-couture-gallery-filter${yearFilter === y ? " widget-couture-gallery-filter--active" : ""}`}
                onClick={() => setYearFilter(y)}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {visibleProjects.length > 0 || editing ? (
        <div className="widget-couture-gallery-grid">
          {visibleProjects.map((project) => (
            <article key={project.id} className="widget-couture-gallery-card">
              <div className="widget-couture-gallery-image-wrap">
                {project.images[0] ? (
                  <img src={project.images[0]} alt={project.title || "Collection image"} className="widget-couture-gallery-image" />
                ) : (
                  <div className="widget-couture-gallery-image widget-couture-gallery-image--placeholder" aria-hidden="true" />
                )}
                {project.tags[0] && <span className="widget-couture-gallery-tag">{project.tags[0]}</span>}
                {editing && (
                  <label className="widget-couture-photo-btn">
                    Change photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="widget-couture-photo-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(project.id, file);
                      }}
                    />
                  </label>
                )}
              </div>
              <EditableText
                as="h3"
                className="widget-couture-gallery-title"
                value={project.title}
                placeholder="Untitled collection"
                onCommit={(next) => updateProject(project.id, { title: next }, "title")}
              />
              <EditableText
                as="p"
                className="widget-couture-gallery-meta"
                value={project.date}
                placeholder="Season Year — N pieces"
                onCommit={(next) => updateProject(project.id, { date: next }, "date")}
              />
              {editing && (
                <button type="button" className="widget-couture-remove widget-couture-remove--static" onClick={() => removeProject(project.id)}>
                  Remove
                </button>
              )}
            </article>
          ))}
          {editing && (
            <button type="button" className="widget-couture-add widget-couture-gallery-add" onClick={addProject}>
              + Add collection
            </button>
          )}
        </div>
      ) : (
        <p className="widget-empty">Add a collection to showcase your work here.</p>
      )}
    </div>
  );
}
