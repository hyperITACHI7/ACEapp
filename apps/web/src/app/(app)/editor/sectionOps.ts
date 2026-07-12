import type { PortfolioData, WidgetInstance } from "@portfolio/schema";
import { getWidget } from "@portfolio/widgets";

function widgetSection(key: string): string | undefined {
  return getWidget(key)?.manifest.section;
}

/**
 * Adds a new instance for `section` (styled as `widgetKey`), swaps an existing instance's
 * style, or shows a hidden instance back — the single resolver the Widget Drawer's dropdowns
 * use for every section. A newly-added widget has no explicit `grid` yet, so it lands at the
 * next free full-width row via `resolveGridLayout`'s default-placement fallback.
 */
export function resolveSectionDrop(prev: PortfolioData, section: string, widgetKey: string): PortfolioData {
  const ordered = [...prev.widgets].sort((a, b) => a.order - b.order);
  const existing = ordered.find((w) => widgetSection(w.key) === section);

  let next: WidgetInstance[];
  if (!existing) {
    next = [...ordered, { key: widgetKey, order: ordered.length, visible: true, config: {} }];
  } else if (existing.key !== widgetKey) {
    next = ordered.map((w) => (w === existing ? { ...w, key: widgetKey, visible: true } : w));
  } else {
    next = ordered.map((w) => (w === existing ? { ...w, visible: true } : w));
  }

  return { ...prev, widgets: next.map((w, i) => ({ ...w, order: i })) };
}

/** Permanently removes a widget instance — distinct from the `visible` toggle, which only hides
 *  it. Re-adding it afterward goes back through `resolveSectionDrop` via the Widget Drawer. */
export function removeWidgetInstance(prev: PortfolioData, key: string): PortfolioData {
  const next = prev.widgets.filter((w) => w.key !== key);
  return { ...prev, widgets: next.map((w, i) => ({ ...w, order: i })) };
}

export interface GridPositionUpdate {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function clampCol(n: number): 0 | 1 {
  return n <= 0 ? 0 : 1;
}

function clampSpan(n: number): 1 | 2 {
  return n <= 1 ? 1 : 2;
}

/** Persists an explicit grid placement for every widget in `positions` at once — used after any
 *  drag/resize interaction in the Outline sidebar's grid, since the drag library reports the
 *  complete current layout (every item, not just the one that moved) on every change. Values
 *  are clamped defensively since they come from a 3rd-party drag library, not our own schema. */
export function updateGridPositions(prev: PortfolioData, positions: GridPositionUpdate[]): PortfolioData {
  const byKey = new Map(positions.map((p) => [p.key, p]));
  return {
    ...prev,
    widgets: prev.widgets.map((w) => {
      const p = byKey.get(w.key);
      if (!p) return w;
      return {
        ...w,
        grid: {
          x: clampCol(p.x),
          y: Math.max(0, Math.round(p.y)),
          w: clampSpan(p.w),
          h: clampSpan(p.h),
        },
      };
    }),
  };
}
