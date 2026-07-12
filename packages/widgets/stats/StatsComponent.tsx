"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

interface StatItem {
  label: string;
  value: string;
  sub?: string;
}

function isStatItem(value: unknown): value is StatItem {
  return typeof value === "object" && value !== null && "label" in value && "value" in value;
}

export function StatsComponent({ config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig } = useEditorMode();
  const heading = typeof config.heading === "string" ? config.heading : "By the numbers";
  const items: StatItem[] = Array.isArray(config.items) ? config.items.filter(isStatItem) : [];

  function setItems(next: StatItem[]) {
    updateWidgetConfig(instanceKey, { items: next });
  }

  function updateItem(index: number, patch: Partial<StatItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems([...items, { label: "Metric", value: "0", sub: "" }]);
  }

  return (
    <div className="widget widget-stats">
      <h2 className="widget-heading">{heading}</h2>
      {items.length > 0 || editing ? (
        <div className="widget-stats-grid">
          {items.map((item, i) => (
            <div key={i} className="widget-stats-item">
              {editing && (
                <button
                  type="button"
                  className="widget-stats-remove"
                  aria-label="Remove stat"
                  onClick={() => removeItem(i)}
                >
                  ×
                </button>
              )}
              <EditableText
                as="div"
                className="widget-stats-value"
                value={item.value}
                placeholder="0"
                onCommit={(next) => updateItem(i, { value: next })}
              />
              <EditableText
                as="div"
                className="widget-stats-label"
                value={item.label}
                placeholder="Label"
                onCommit={(next) => updateItem(i, { label: next })}
              />
              {(editing || item.sub) && (
                <EditableText
                  as="div"
                  className="widget-stats-sub"
                  value={item.sub ?? ""}
                  placeholder="Subtitle"
                  onCommit={(next) => updateItem(i, { sub: next })}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="widget-empty">Add a few stats to highlight your track record.</p>
      )}
      {editing && (
        <button type="button" className="widget-stats-add" onClick={addItem}>
          + Add stat
        </button>
      )}
    </div>
  );
}
