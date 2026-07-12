"use client";

import type { WidgetProps } from "../types";
import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { Experience } from "@portfolio/schema";

export function ExperienceTimelineAnimatedComponent({ data, config }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Work Experience";
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

  function addTag(index: number) {
    updateEntry(index, { tags: [...experience[index].tags, "Tag"] });
  }

  function updateTag(index: number, tagIndex: number, value: string) {
    const next = [...experience[index].tags];
    if (!value.trim()) next.splice(tagIndex, 1);
    else next[tagIndex] = value.trim();
    updateEntry(index, { tags: next });
  }

  return (
    <div className="widget widget-experience-animated">
      <span className="widget-eyebrow widget-eyebrow--accent">{eyebrow}</span>
      {experience.length > 0 || editing ? (
        <div className="widget-experience-animated-list">
          {experience.map((entry, i) => (
            <div key={`experience-${i}`} className="widget-experience-animated-entry">
              <div className="widget-experience-animated-head">
                <div>
                  <EditableText
                    as="div"
                    className="widget-experience-animated-role"
                    value={entry.role}
                    placeholder="Role"
                    onCommit={(next) => updateEntry(i, { role: next })}
                  />
                  <EditableText
                    as="div"
                    className="widget-experience-animated-org"
                    value={entry.org}
                    placeholder="Organization"
                    onCommit={(next) => updateEntry(i, { org: next })}
                  />
                </div>
                {(editing || entry.dates) && (
                  <EditableText
                    as="span"
                    className="widget-experience-animated-dates"
                    value={entry.dates}
                    placeholder="Dates"
                    onCommit={(next) => updateEntry(i, { dates: next })}
                  />
                )}
              </div>
              {(editing || entry.description) && (
                <EditableText
                  as="p"
                  className="widget-experience-animated-desc"
                  value={entry.description}
                  placeholder="Add a description"
                  multiline
                  onCommit={(next) => updateEntry(i, { description: next })}
                />
              )}
              {(editing || entry.tags.length > 0) && (
                <div className="widget-experience-animated-tags">
                  {entry.tags.map((tag, ti) => (
                    <span key={ti} className="widget-experience-animated-tag">
                      <EditableText as="span" value={tag} placeholder="Tag" onCommit={(next) => updateTag(i, ti, next)} />
                    </span>
                  ))}
                  {editing && (
                    <button type="button" className="widget-gallery-cards-tag-add" onClick={() => addTag(i)}>
                      + Tag
                    </button>
                  )}
                </div>
              )}
              {editing && (
                <button type="button" className="widget-timeline-remove" onClick={() => removeEntry(i)}>
                  Remove entry
                </button>
              )}
            </div>
          ))}
        </div>
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
