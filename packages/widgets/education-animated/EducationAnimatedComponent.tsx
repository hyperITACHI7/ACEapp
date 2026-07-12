"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

interface EducationItem {
  school: string;
  degree: string;
  period: string;
  description?: string;
}

function isEducationItem(value: unknown): value is EducationItem {
  return typeof value === "object" && value !== null && "school" in value && "degree" in value;
}

export function EducationAnimatedComponent({ config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Education";
  const items: EducationItem[] = Array.isArray(config.items) ? config.items.filter(isEducationItem) : [];

  function setItems(next: EducationItem[]) {
    updateWidgetConfig(instanceKey, { items: next });
  }

  function updateItem(index: number, patch: Partial<EducationItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems([...items, { school: "School", degree: "Degree", period: "", description: "" }]);
  }

  return (
    <div className="widget widget-education-animated">
      <span className="widget-eyebrow widget-eyebrow--accent">{eyebrow}</span>
      {items.length > 0 || editing ? (
        <div className="widget-education-animated-list">
          {items.map((item, i) => (
            <div key={i} className="widget-education-animated-entry">
              <div className="widget-education-animated-row">
                <div>
                  <EditableText
                    as="div"
                    className="widget-education-animated-degree"
                    value={item.degree}
                    placeholder="Degree"
                    onCommit={(next) => updateItem(i, { degree: next })}
                  />
                  <EditableText
                    as="span"
                    className="widget-education-animated-school"
                    value={item.school}
                    placeholder="School"
                    onCommit={(next) => updateItem(i, { school: next })}
                  />
                </div>
                {(editing || item.period) && (
                  <EditableText
                    as="span"
                    className="widget-education-animated-period"
                    value={item.period}
                    placeholder="Year"
                    onCommit={(next) => updateItem(i, { period: next })}
                  />
                )}
              </div>
              {(editing || item.description) && (
                <EditableText
                  as="p"
                  className="widget-education-animated-desc"
                  value={item.description ?? ""}
                  placeholder="Add a description"
                  multiline
                  onCommit={(next) => updateItem(i, { description: next })}
                />
              )}
              {editing && (
                <button type="button" className="widget-education-remove" onClick={() => removeItem(i)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="widget-empty">Add your education to build a background section.</p>
      )}
      {editing && (
        <button type="button" className="widget-education-add" onClick={addItem}>
          + Add education
        </button>
      )}
    </div>
  );
}
