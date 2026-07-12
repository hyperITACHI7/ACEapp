"use client";

import type { WidgetProps } from "../types";
import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { Experience } from "@portfolio/schema";

export function ExperienceTimelineComponent({ data, config }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const heading = typeof config.heading === "string" ? config.heading : "Experience";
  const experience = data.experience;

  function updateEntry(index: number, patch: Partial<Experience>) {
    updateDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  function removeEntry(index: number) {
    updateDraft((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  }

  function addEntry() {
    updateDraft((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { role: "Role", org: "Organization", dates: "", description: "", source: "manual" as const, tags: [] },
      ],
    }));
  }

  return (
    <div className="widget widget-experience-timeline">
      <h2 className="widget-heading">{heading}</h2>
      {experience.length > 0 || editing ? (
        <ol className="widget-timeline">
          {experience.map((entry, i) => (
            <li key={`experience-${i}`} className="widget-timeline-entry">
              <EditableText
                as="div"
                className="widget-timeline-role"
                value={entry.role}
                placeholder="Role"
                onCommit={(next) => updateEntry(i, { role: next })}
              />
              <div className="widget-timeline-org">
                <EditableText
                  as="span"
                  value={entry.org}
                  placeholder="Organization"
                  onCommit={(next) => updateEntry(i, { org: next })}
                />
                {(editing || entry.dates) && (
                  <span className="widget-timeline-dates">
                    {" "}
                    ·{" "}
                    <EditableText
                      as="span"
                      value={entry.dates}
                      placeholder="Dates"
                      onCommit={(next) => updateEntry(i, { dates: next })}
                    />
                  </span>
                )}
              </div>
              {(editing || entry.description) && (
                <EditableText
                  as="p"
                  className="widget-timeline-desc"
                  value={entry.description}
                  placeholder="Add a description"
                  multiline
                  onCommit={(next) => updateEntry(i, { description: next })}
                />
              )}
              {editing && (
                <button type="button" className="widget-timeline-remove" onClick={() => removeEntry(i)}>
                  Remove entry
                </button>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="widget-empty">Add your work experience to build a timeline.</p>
      )}
      {editing && (
        <button type="button" className="widget-timeline-add" onClick={addEntry}>
          + Add experience
        </button>
      )}
    </div>
  );
}
