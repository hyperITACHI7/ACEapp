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

export function AwardsComponent({ config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig } = useEditorMode();
  const heading = typeof config.heading === "string" ? config.heading : "Awards & Recognition";
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
    <div className="widget widget-awards">
      <h2 className="widget-heading">{heading}</h2>
      {items.length > 0 || editing ? (
        <ul className="widget-awards-list">
          {items.map((item, i) => (
            <li key={i} className="widget-awards-row">
              <div className="widget-awards-main">
                <EditableText
                  as="span"
                  className="widget-awards-name"
                  value={item.award}
                  placeholder="Award name"
                  onCommit={(next) => updateItem(i, { award: next })}
                />
                {(editing || item.context) && (
                  <EditableText
                    as="span"
                    className="widget-awards-context"
                    value={item.context ?? ""}
                    placeholder="Project or context"
                    onCommit={(next) => updateItem(i, { context: next })}
                  />
                )}
              </div>
              <div className="widget-awards-side">
                {(editing || item.year) && (
                  <EditableText
                    as="span"
                    className="widget-awards-year"
                    value={item.year ?? ""}
                    placeholder="Year"
                    onCommit={(next) => updateItem(i, { year: next })}
                  />
                )}
                {editing && (
                  <button type="button" className="widget-awards-remove" onClick={() => removeItem(i)}>
                    ×
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
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
