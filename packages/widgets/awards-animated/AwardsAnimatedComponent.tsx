"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

interface AwardItem {
  award: string;
  context?: string;
  year?: string;
}

function isAwardItem(value: unknown): value is AwardItem {
  return typeof value === "object" && value !== null && "award" in value;
}

export function AwardsAnimatedComponent({ config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Recognition";
  const items: AwardItem[] = Array.isArray(config.items) ? config.items.filter(isAwardItem) : [];

  function setItems(next: AwardItem[]) {
    updateWidgetConfig(instanceKey, { items: next });
  }

  function updateItem(index: number, patch: Partial<AwardItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems([...items, { award: "Award name", context: "", year: "" }]);
  }

  return (
    <div className="widget widget-awards-animated">
      <span className="widget-eyebrow widget-eyebrow--accent">{eyebrow}</span>
      {items.length > 0 || editing ? (
        <div className="widget-awards-animated-list">
          {items.map((item, i) => (
            <div key={i} className="widget-awards-animated-row">
              <div className="widget-awards-animated-main">
                <EditableText
                  as="span"
                  className="widget-awards-animated-name"
                  value={item.award}
                  placeholder="Award name"
                  onCommit={(next) => updateItem(i, { award: next })}
                />
                {(editing || item.context) && (
                  <EditableText
                    as="span"
                    className="widget-awards-animated-context"
                    value={item.context ?? ""}
                    placeholder="Project or context"
                    onCommit={(next) => updateItem(i, { context: next })}
                  />
                )}
              </div>
              {editing ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <EditableText
                    as="span"
                    className="widget-awards-animated-year-edit"
                    value={item.year ?? ""}
                    placeholder="Year"
                    onCommit={(next) => updateItem(i, { year: next })}
                  />
                  <button type="button" className="widget-awards-remove" onClick={() => removeItem(i)}>
                    ×
                  </button>
                </div>
              ) : (
                item.year && <span className="widget-awards-animated-year">{item.year}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="widget-empty">Add awards or recognition to highlight your achievements.</p>
      )}
      {editing && (
        <button type="button" className="widget-awards-add" onClick={addItem}>
          + Add award
        </button>
      )}
    </div>
  );
}
