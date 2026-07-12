"use client";

import type { WidgetProps } from "../types";
import { EditableText, useEditorMode } from "@portfolio/ui-kit";

/** Reads the shared `data.skills` list. While editing, falls back to a plain editable tag
 *  list (same interaction as the base Skills widget) since an auto-scrolling marquee can't
 *  also be a text field; the marquee itself only plays in read mode. Deliberately has no
 *  heading — this section is a pure full-bleed ticker between two hairline borders. */
export function SkillsMarqueeComponent({ data }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const visibleSkills = data.skills.filter(Boolean);

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

  if (editing) {
    return (
      <div className="widget widget-skills-marquee">
        <ul className="widget-skills-list">
          {data.skills.map((skill, i) => (
            <li key={`skill-${i}`} className="widget-skill-tag">
              <EditableText as="span" value={skill} placeholder="Skill" onCommit={(next) => commitSkill(i, next)} />
              <button
                type="button"
                className="widget-skill-remove"
                aria-label={`Remove ${skill || "skill"}`}
                onClick={() => removeSkill(i)}
              >
                ×
              </button>
            </li>
          ))}
          <li className="widget-skill-tag widget-skill-tag--add">
            <button type="button" onClick={addSkill}>
              + Add skill
            </button>
          </li>
        </ul>
      </div>
    );
  }

  if (visibleSkills.length === 0) {
    return (
      <div className="widget widget-skills-marquee">
        <p className="widget-empty">Add a few skills to showcase your strengths.</p>
      </div>
    );
  }

  const half = Math.ceil(visibleSkills.length / 2);
  const rowA = visibleSkills.slice(0, half);
  const rowB = visibleSkills.length > 1 ? visibleSkills.slice(half) : rowA;

  return (
    <div className="widget widget-skills-marquee">
      <div className="widget-skills-marquee-fullbleed">
        <div className="widget-skills-marquee-row widget-skills-marquee-row--a">
          <div className="widget-skills-marquee-track">
            {[...rowA, ...rowA].map((skill, i) => (
              <span key={i} className="widget-skills-marquee-item">
                <span className="widget-skills-marquee-dot" />
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="widget-skills-marquee-row widget-skills-marquee-row--b">
          <div className="widget-skills-marquee-track">
            {[...rowB, ...rowB].map((skill, i) => (
              <span key={i} className="widget-skills-marquee-item">
                <span className="widget-skills-marquee-dot" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
