"use client";

import { ArrowUpRight } from "lucide-react";
import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import { resolveGridLayout } from "@portfolio/schema";
import type { WidgetProps } from "../types";

interface AwardItem {
  year: string;
  title: string;
  org: string;
  category: string;
}
function isAwardItem(v: unknown): v is AwardItem {
  return typeof v === "object" && v !== null && "title" in v;
}

function renderHeading(heading: string) {
  const lines = heading.split("\n");
  if (lines.length < 2) return heading;
  return (
    <>
      {lines[0]}
      <br />
      <span className="widget-heading-line--accent">{lines.slice(1).join(" ")}</span>
    </>
  );
}

/**
 * Size variants (manifest sizes ["1x2","1x1","2x1"]; native = 1x2, the reference's half-column
 * stack beside Skills). Footprint comes from the JS lookup, NOT @container — container queries
 * here respond to the whole portfolio's width, so a half-width cell would wrongly match wide
 * breakpoints:
 * - 1x2 (native): stacked — intro block on top, full list below
 * - 2x1: `--wide` — intro and list side by side across the full row
 * - 1x1: `--compact` — top 3 items only (all items while editing), intro copy + stat box hidden
 */
export function CoutureEditorialAwardsComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Recognition";
  const heading = typeof config.heading === "string" ? config.heading : "Awards &\nHonours";
  const intro = typeof config.intro === "string" ? config.intro : "";
  const allItems: AwardItem[] = Array.isArray(config.items) ? config.items.filter(isAwardItem) : [];

  const grid = resolveGridLayout(data.widgets.filter((w) => w.visible), data.navGroups ?? []).find(
    (g) => g.key === instanceKey
  );
  const wide = (grid?.w ?? 1) === 2;
  const compact = !wide && (grid?.h ?? 2) === 1;
  const items = compact && !editing ? allItems.slice(0, 3) : allItems;

  function setItems(next: AwardItem[]) {
    updateWidgetConfig(instanceKey, { items: next });
  }
  function updateItem(i: number, patch: Partial<AwardItem>) {
    setItems(allItems.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }
  function removeItem(i: number) {
    setItems(allItems.filter((_, idx) => idx !== i));
  }
  function addItem() {
    setItems([...allItems, { year: new Date().getFullYear().toString(), title: "Award name", org: "Organization", category: "Category" }]);
  }

  return (
    <div
      className={`widget widget-couture-awards${wide ? " widget-couture-awards--wide" : ""}${compact ? " widget-couture-awards--compact" : ""}`}
    >
      <div className="widget-couture-awards-intro">
        <span className="widget-eyebrow">{eyebrow}</span>
        <h2 className="widget-heading widget-heading--couture">{renderHeading(heading)}</h2>
        {intro && !compact && <p className="widget-couture-awards-copy">{intro}</p>}
        {allItems.length > 0 && !compact && (
          <div className="widget-couture-awards-stat">
            <span className="widget-couture-awards-stat-value">{allItems.length}</span>
            <span className="widget-couture-awards-stat-label">Total Recognitions</span>
          </div>
        )}
      </div>

      <div className="widget-couture-awards-list">
        {items.length > 0 || editing ? (
          items.map((item, i) => (
            <div key={i} className="widget-couture-awards-row">
              <div className="widget-couture-awards-row-main">
                <EditableText
                  as="span"
                  className="widget-couture-awards-year"
                  value={item.year}
                  placeholder="Year"
                  onCommit={(next) => updateItem(i, { year: next })}
                />
                <div>
                  <EditableText
                    as="h3"
                    className="widget-couture-awards-title"
                    value={item.title}
                    placeholder="Award name"
                    onCommit={(next) => updateItem(i, { title: next })}
                  />
                  <EditableText
                    as="span"
                    className="widget-couture-awards-org"
                    value={item.org}
                    placeholder="Organization"
                    onCommit={(next) => updateItem(i, { org: next })}
                  />
                  {" · "}
                  <EditableText
                    as="span"
                    className="widget-couture-awards-category"
                    value={item.category}
                    placeholder="Category"
                    onCommit={(next) => updateItem(i, { category: next })}
                  />
                </div>
              </div>
              {editing ? (
                <button type="button" className="widget-couture-remove" onClick={() => removeItem(i)}>
                  ×
                </button>
              ) : (
                <ArrowUpRight size={14} className="widget-couture-awards-arrow" />
              )}
            </div>
          ))
        ) : (
          <p className="widget-empty">Add awards or recognition to highlight your achievements.</p>
        )}
        {editing && (
          <button type="button" className="widget-couture-add widget-couture-add--block" onClick={addItem}>
            + Add award
          </button>
        )}
      </div>
    </div>
  );
}
