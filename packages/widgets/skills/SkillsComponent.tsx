"use client";

import type { WidgetProps } from "../types";
import { EditableText, useEditorMode } from "@portfolio/ui-kit";

export function SkillsComponent({ data, config }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const heading = typeof config.heading === "string" ? config.heading : "Skills";
  const visibleSkills = data.skills.filter(Boolean);
  const showEmpty = !editing && visibleSkills.length === 0;

  function commitSkill(index: number, next: string) {
    const trimmed = next.trim();
    updateDraft((prev) => {
      const nextSkills = [...prev.skills];
      if (!trimmed) nextSkills.splice(index, 1);
      else nextSkills[index] = trimmed;
      return { ...prev, skills: nextSkills };
    });
  }

  function removeSkill(index: number) {
    updateDraft((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  }

  function addSkill() {
    updateDraft((prev) => ({ ...prev, skills: [...prev.skills, "New skill"] }));
  }

  return (
    <div className="widget widget-skills">
      <h2 className="widget-heading">{heading}</h2>
      {showEmpty ? (
        <p className="widget-empty">Add a few skills to showcase your strengths.</p>
      ) : (
        <ul className="widget-skills-list">
          {(editing ? data.skills : visibleSkills).map((skill, i) => (
            <li key={`skill-${i}`} className="widget-skill-tag">
              <EditableText as="span" value={skill} placeholder="Skill" onCommit={(next) => commitSkill(i, next)} />
              {editing && (
                <button
                  type="button"
                  className="widget-skill-remove"
                  aria-label={`Remove ${skill || "skill"}`}
                  onClick={() => removeSkill(i)}
                >
                  ×
                </button>
              )}
            </li>
          ))}
          {editing && (
            <li className="widget-skill-tag widget-skill-tag--add">
              <button type="button" onClick={addSkill}>
                + Add skill
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
