"use client";

import type { WidgetInstance } from "@portfolio/schema";
import { listWidgetsBySection } from "@portfolio/widgets";
import { sectionIcon, sectionColor, sectionLabel } from "./sectionMeta";

interface WidgetDrawerProps {
  widgets: WidgetInstance[];
  onSelect: (section: string, widgetKey: string) => void;
}

const PLACEHOLDER = "__none__";

/**
 * Pure style picker: one row per content section, one dropdown per row listing every widget
 * style registered for that section (across the whole app, regardless of which theme
 * introduced it — widgets are theme-agnostic). Choosing an option adds the section if it
 * isn't present yet, or swaps its style in place if it already is. No drag-and-drop here —
 * reordering sections is the left Outline sidebar's job.
 */
export function WidgetDrawer({ widgets, onSelect }: WidgetDrawerProps) {
  const bySection = listWidgetsBySection();

  const currentBySection: Record<string, WidgetInstance | undefined> = {};
  for (const [section, mods] of Object.entries(bySection)) {
    const keys = new Set(mods.map((m) => m.manifest.key));
    currentBySection[section] = widgets.find((w) => keys.has(w.key));
  }

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(bySection).map(([section, mods]) => {
        const current = currentBySection[section];
        const color = sectionColor(section);
        const Icon = sectionIcon(section);
        return (
          <div key={section} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}22`, color }}
              >
                <Icon size={13} />
              </span>
              <span className="text-sm font-medium truncate">{sectionLabel(section)}</span>
              {current && !current.visible && (
                <span className="text-xs text-muted-foreground shrink-0">(hidden)</span>
              )}
            </div>
            <select
              value={current?.key ?? PLACEHOLDER}
              onChange={(e) => {
                if (e.target.value !== PLACEHOLDER) onSelect(section, e.target.value);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-purple-400/60 transition-colors"
            >
              {!current && (
                <option value={PLACEHOLDER} disabled>
                  Select a style…
                </option>
              )}
              {mods.map((mod) => (
                <option key={mod.manifest.key} value={mod.manifest.key}>
                  {mod.manifest.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
