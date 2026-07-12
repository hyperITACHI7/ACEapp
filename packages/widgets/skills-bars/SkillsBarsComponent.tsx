"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

interface SkillBarItem {
  name: string;
  level: number;
}

function isSkillBarItem(value: unknown): value is SkillBarItem {
  return typeof value === "object" && value !== null && "name" in value && "level" in value;
}

/** Self-contained skill+level list (own `config.items`, independent of the shared
 *  `data.skills: string[]` the plain Skills widget reads) — proficiency level has nowhere
 *  else to live, so this style keeps its own data, same as Stats/Quote. */
export function SkillsBarsComponent({ config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig } = useEditorMode();
  const heading = typeof config.heading === "string" ? config.heading : "Skills";
  const items: SkillBarItem[] = Array.isArray(config.items) ? config.items.filter(isSkillBarItem) : [];

  function setItems(next: SkillBarItem[]) {
    updateWidgetConfig(instanceKey, { items: next });
  }

  function updateItem(index: number, patch: Partial<SkillBarItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems([...items, { name: "New skill", level: 70 }]);
  }

  return (
    <div className="widget widget-skills-bars">
      <h2 className="widget-heading">{heading}</h2>
      {items.length > 0 || editing ? (
        <div className="widget-skills-bars-list">
          {items.map((item, i) => (
            <div key={i} className="widget-skills-bar-row">
              <EditableText
                as="span"
                className="widget-skills-bar-name"
                value={item.name}
                placeholder="Skill"
                onCommit={(next) => updateItem(i, { name: next })}
              />
              <div className="widget-skills-bar-track">
                <div className="widget-skills-bar-fill" style={{ width: `${item.level}%` }} />
              </div>
              <span className="widget-skills-bar-pct">{item.level}%</span>
              {editing && (
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={item.level}
                  onChange={(e) => updateItem(i, { level: Number(e.target.value) })}
                  className="widget-skills-bar-slider"
                  aria-label={`${item.name} level`}
                />
              )}
              {editing && (
                <button type="button" className="widget-skills-bar-remove" onClick={() => removeItem(i)}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="widget-empty">Add a few skills to showcase your strengths.</p>
      )}
      {editing && (
        <button type="button" className="widget-skills-bar-add" onClick={addItem}>
          + Add skill
        </button>
      )}
    </div>
  );
}
