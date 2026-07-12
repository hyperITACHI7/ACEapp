"use client";

import type { WidgetProps } from "../types";
import { EditableText, useEditorMode, useToast } from "@portfolio/ui-kit";
import { createManualProject, updateProjectField, type Project } from "@portfolio/schema";

interface ProjectCardProps {
  project: Project;
  editing: boolean;
  onUpdate: (patch: Partial<Project>, editedField?: string) => void;
  onRemove: () => void;
  onUploadImage: (file: File) => void;
}

function ProjectCard({ project, editing, onUpdate, onRemove, onUploadImage }: ProjectCardProps) {
  return (
    <article className="widget-gallery-card">
      <div className="widget-gallery-image-wrap">
        {project.images[0] ? (
          <img src={project.images[0]} alt={project.title || "Project image"} className="widget-gallery-image" />
        ) : (
          <div className="widget-gallery-image widget-gallery-image--placeholder" aria-hidden="true" />
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
        {editing && (
          <button type="button" className="widget-gallery-remove" aria-label="Remove project" onClick={onRemove}>
            ×
          </button>
        )}
      </div>
      {project.sourceUnavailable && (
        <p className="widget-gallery-warning">This project&apos;s source repo is no longer available.</p>
      )}
      <EditableText
        as="h3"
        className="widget-gallery-title"
        value={project.title}
        placeholder="Untitled project"
        onCommit={(next) => onUpdate({ title: next }, "title")}
      />
      {(editing || project.date) && (
        <EditableText
          as="span"
          className="widget-gallery-date"
          value={project.date}
          placeholder="Date"
          onCommit={(next) => onUpdate({ date: next }, "date")}
        />
      )}
      {(editing || project.description) && (
        <EditableText
          as="p"
          className="widget-gallery-desc"
          value={project.description}
          placeholder="Add a description"
          multiline
          onCommit={(next) => onUpdate({ description: next }, "description")}
        />
      )}
      {editing ? (
        <EditableText
          as="span"
          className="widget-gallery-link widget-gallery-link--editable"
          value={project.links[0] ?? ""}
          placeholder="https://link-to-project"
          onCommit={(next) => onUpdate({ links: next.trim() ? [next.trim()] : [] }, "links")}
        />
      ) : (
        project.links[0] && (
          <a href={project.links[0]} target="_blank" rel="noreferrer" className="widget-gallery-link">
            View project
          </a>
        )
      )}
    </article>
  );
}

export function GalleryComponent({ data, config }: WidgetProps) {
  const { editing, updateDraft, uploadImage } = useEditorMode();
  const { showToast } = useToast();
  const heading = typeof config.heading === "string" ? config.heading : "Work";
  const projects = editing ? data.projects : data.projects.filter((p) => !p.sourceUnavailable);

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
    <div className="widget widget-gallery">
      <h2 className="widget-heading">{heading}</h2>
      {projects.length > 0 || editing ? (
        <div className="widget-gallery-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              editing={editing}
              onUpdate={(patch, editedField) => updateProject(project.id, patch, editedField)}
              onRemove={() => removeProject(project.id)}
              onUploadImage={(file) => handleUploadImage(project.id, file)}
            />
          ))}
          {editing && (
            <button type="button" className="widget-gallery-add" onClick={addProject}>
              + Add project
            </button>
          )}
        </div>
      ) : (
        <p className="widget-empty">Add a project to showcase your work here.</p>
      )}
    </div>
  );
}
