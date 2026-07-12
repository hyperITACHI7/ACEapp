"use client";

import { useState } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { EditableText, useEditorMode, useToast } from "@portfolio/ui-kit";
import { createManualProject, resolveGridLayout, updateProjectField, type Project } from "@portfolio/schema";
import type { WidgetProps } from "../types";

/**
 * This widget is the one gallery style whose display adapts to its own size in the shared
 * 2-column grid (see `resolveGridLayout`) — narrower/shorter placements show fewer projects
 * inline, with "View All" (an overlay, not an inline expansion) as the universal escape hatch and
 * horizontal scroll-paging as an additional shortcut for the taller/larger sizes. `gallery` and
 * `gallery-cards` are plain, unsized widgets and intentionally don't do any of this.
 */
function sizeConfig(w: number, h: number): { slotCount: number; scroll: boolean; narrow: boolean } {
  if (w === 1 && h === 1) return { slotCount: 1, scroll: false, narrow: true };
  if (w === 1) return { slotCount: 2, scroll: true, narrow: true }; // 1x2, tall
  if (h === 1) return { slotCount: 2, scroll: false, narrow: false }; // 2x1, wide — no scroll at all
  return { slotCount: 4, scroll: true, narrow: false }; // 2x2
}

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks.length > 0 ? chunks : [[]];
}

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

interface ProjectCardProps {
  index: number;
  project: Project;
  editing: boolean;
  onUpdate: (patch: Partial<Project>, editedField?: string) => void;
  onRemove: () => void;
  onUploadImage: (file: File) => void;
}

function ProjectCard({ index, project, editing, onUpdate, onRemove, onUploadImage }: ProjectCardProps) {
  function addTag() {
    onUpdate({ tags: [...project.tags, "Tag"] });
  }
  function updateTag(i: number, value: string) {
    const next = [...project.tags];
    if (!value.trim()) next.splice(i, 1);
    else next[i] = value.trim();
    onUpdate({ tags: next });
  }

  return (
    <article className="widget-gallery-animated-card">
      <div className="widget-gallery-animated-image-wrap">
        {project.images[0] ? (
          <img src={project.images[0]} alt={project.title || "Project image"} className="widget-gallery-animated-image" />
        ) : (
          <div className="widget-gallery-animated-image widget-gallery-animated-image--placeholder" aria-hidden="true" />
        )}
        {editing && (
          <label className="widget-gallery-photo-btn">
            Change photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="widget-gallery-photo-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(file);
              }}
            />
          </label>
        )}
      </div>
      <div className="widget-gallery-animated-content">
        <div className="widget-gallery-animated-body">
          {project.sourceUnavailable && (
            <p className="widget-gallery-warning">This project&apos;s source repo is no longer available.</p>
          )}
          <div className="widget-gallery-animated-meta">
            <span className="widget-gallery-animated-index">{String(index + 1).padStart(2, "0")}</span>
            {(editing || project.date) && (
              <EditableText
                as="span"
                className="widget-gallery-animated-date"
                value={project.date}
                placeholder="Date"
                onCommit={(next) => onUpdate({ date: next }, "date")}
              />
            )}
          </div>
          <EditableText
            as="h3"
            className="widget-gallery-animated-title"
            value={project.title}
            placeholder="Untitled project"
            onCommit={(next) => onUpdate({ title: next }, "title")}
          />
          {(editing || project.description) && (
            <EditableText
              as="p"
              className="widget-gallery-animated-desc"
              value={project.description}
              placeholder="Add a description"
              multiline
              onCommit={(next) => onUpdate({ description: next }, "description")}
            />
          )}
          {(editing || project.tags.length > 0) && (
            <div className="widget-gallery-animated-tags">
              {project.tags.map((tag, i) => (
                <span key={i} className="widget-gallery-animated-tag">
                  <EditableText as="span" value={tag} placeholder="Tag" onCommit={(next) => updateTag(i, next)} />
                </span>
              ))}
              {editing && (
                <button type="button" className="widget-gallery-cards-tag-add" onClick={addTag}>
                  + Tag
                </button>
              )}
            </div>
          )}
          {editing && (
            <EditableText
              as="span"
              className="widget-gallery-link widget-gallery-link--editable"
              value={project.links[0] ?? ""}
              placeholder="https://link-to-project"
              onCommit={(next) => onUpdate({ links: next.trim() ? [next.trim()] : [] }, "links")}
            />
          )}
          {editing && (
            <button type="button" className="widget-timeline-remove" onClick={onRemove}>
              Remove project
            </button>
          )}
        </div>
        {!editing && project.links[0] && (
          <a
            href={project.links[0]}
            target="_blank"
            rel="noreferrer"
            className="widget-gallery-animated-arrow"
            aria-label={`View ${project.title}`}
          >
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </article>
  );
}

export function GalleryAnimatedComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateDraft, uploadImage } = useEditorMode();
  const { showToast } = useToast();
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Selected Work";
  const heading = typeof config.heading === "string" ? config.heading : "Projects I'm\nproud of";
  const projects = editing ? data.projects : data.projects.filter((p) => !p.sourceUnavailable);

  const grid = resolveGridLayout(data.widgets.filter((w) => w.visible)).find((g) => g.key === instanceKey);
  const { slotCount, scroll, narrow } = sizeConfig(grid?.w ?? 2, grid?.h ?? 1);
  const chunks = chunk(projects, slotCount);
  const hasMore = projects.length > slotCount;
  const pageClassName = `widget-gallery-animated-grid${narrow ? " widget-gallery-animated-grid--narrow" : ""}`;

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

  function renderCard(project: Project, index: number) {
    return (
      <ProjectCard
        key={project.id}
        index={index}
        project={project}
        editing={editing}
        onUpdate={(patch, editedField) => updateProject(project.id, patch, editedField)}
        onRemove={() => removeProject(project.id)}
        onUploadImage={(file) => handleUploadImage(project.id, file)}
      />
    );
  }

  // Only offer the inline "+ Add project" button when every project already fits on-screen —
  // once there's overflow, adding happens inside the View All overlay instead, which is the one
  // place every project (visible or not) is always reachable.
  const showInlineAdd = editing && !hasMore;

  return (
    <div className="widget widget-gallery-animated">
      <span className="widget-eyebrow">{eyebrow}</span>
      <h2 className="widget-heading widget-heading--animated">{renderHeading(heading)}</h2>
      {projects.length > 0 || editing ? (
        <>
          {scroll && chunks.length > 1 ? (
            <div className="widget-gallery-animated-scroller no-scrollbar">
              {chunks.map((pageProjects, ci) => (
                <div key={ci} className={pageClassName}>
                  {pageProjects.map((project, i) => renderCard(project, ci * slotCount + i))}
                </div>
              ))}
            </div>
          ) : (
            <div className={pageClassName}>
              {(chunks[0] ?? []).map((project, i) => renderCard(project, i))}
              {showInlineAdd && (
                <button type="button" className="widget-gallery-add" onClick={addProject}>
                  + Add project
                </button>
              )}
            </div>
          )}
          {hasMore && (
            <button type="button" className="widget-gallery-animated-viewall-btn" onClick={() => setViewAllOpen(true)}>
              View all projects ({projects.length})
            </button>
          )}
        </>
      ) : (
        <p className="widget-empty">Add a project to showcase your work here.</p>
      )}

      <RadixDialog.Root open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="widget-gallery-animated-overlay-backdrop" />
          <RadixDialog.Content className="widget-gallery-animated-overlay">
            <div className="widget-gallery-animated-overlay-panel">
              <div className="widget-gallery-animated-overlay-header">
                <RadixDialog.Title className="widget-gallery-animated-overlay-title">All projects</RadixDialog.Title>
                <RadixDialog.Close className="widget-gallery-animated-overlay-close" aria-label="Close">
                  <X size={18} />
                </RadixDialog.Close>
              </div>
              <div className="widget-gallery-animated-grid">
                {projects.map((project, i) => renderCard(project, i))}
                {editing && (
                  <button type="button" className="widget-gallery-add" onClick={addProject}>
                    + Add project
                  </button>
                )}
              </div>
            </div>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    </div>
  );
}
