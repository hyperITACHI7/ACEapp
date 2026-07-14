import type { NavGroup, PortfolioData, WidgetInstance } from "@portfolio/schema";
import { getWidget } from "@portfolio/widgets";
import { sectionLabel } from "./sectionMeta";

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

/** Persists a new mobile order for every widget at once — `orderedKeys` is the full flat
 *  sequence (across all sections) the mobile Outline sidebar currently shows. Mobile has no
 *  separate position/size, only order + visibility (see `WidgetInstanceSchema.mobileOrder`). */
export function updateMobileOrder(prev: PortfolioData, orderedKeys: string[]): PortfolioData {
  const indexByKey = new Map(orderedKeys.map((k, i) => [k, i]));
  return {
    ...prev,
    widgets: prev.widgets.map((w) => (indexByKey.has(w.key) ? { ...w, mobileOrder: indexByKey.get(w.key)! } : w)),
  };
}

/** Flips a widget's mobile-only visibility, independent of its desktop `visible` flag — falls
 *  back to `visible` the first time it's toggled (never customized before), same "absence
 *  inherits the desktop value" convention as `mobileOrder`/`grid`. */
export function toggleMobileVisible(prev: PortfolioData, key: string): PortfolioData {
  return {
    ...prev,
    widgets: prev.widgets.map((w) => {
      if (w.key !== key) return w;
      const current = w.mobileVisible ?? w.visible;
      return { ...w, mobileVisible: !current };
    }),
  };
}

/** Creates a new, empty, immediately-renameable nav section appended to the end. Name is
 *  de-duped against existing section names ("New Section", "New Section 2", ...). */
export function createNavGroup(prev: PortfolioData): PortfolioData {
  const groups = prev.navGroups ?? [];
  const existingNames = new Set(groups.map((g) => g.name));
  let name = "New Section";
  let n = 2;
  while (existingNames.has(name)) {
    name = `New Section ${n}`;
    n++;
  }
  const group: NavGroup = { id: crypto.randomUUID(), name, order: groups.length, showInNav: true };
  return { ...prev, navGroups: [...groups, group] };
}

export function renameNavGroup(prev: PortfolioData, groupId: string, name: string): PortfolioData {
  const groups = prev.navGroups ?? [];
  return { ...prev, navGroups: groups.map((g) => (g.id === groupId ? { ...g, name } : g)) };
}

/** Flips whether a section's link shows in a theme's nav header — purely a nav-level switch,
 *  independent of whether its widgets are visible/positioned in the sidebar or portfolio. */
export function toggleNavGroupVisible(prev: PortfolioData, groupId: string): PortfolioData {
  const groups = prev.navGroups ?? [];
  return { ...prev, navGroups: groups.map((g) => (g.id === groupId ? { ...g, showInNav: !g.showInNav } : g)) };
}

/** Moves a section to sit at another section's position — drag-and-drop reordering (grab a
 *  section's handle, drop it on another section) rather than single-step up/down swaps. */
export function reorderNavGroup(prev: PortfolioData, draggedId: string, targetId: string): PortfolioData {
  const groups = [...(prev.navGroups ?? [])].sort((a, b) => a.order - b.order);
  const fromIndex = groups.findIndex((g) => g.id === draggedId);
  const toIndex = groups.findIndex((g) => g.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
  const [moved] = groups.splice(fromIndex, 1);
  groups.splice(toIndex, 0, moved!);
  const navGroups = groups.map((g, i) => ({ ...g, order: i }));
  return { ...prev, navGroups };
}

/** Removes a section — its widgets fall back to "Ungrouped" (never deleted), and remaining
 *  sections' `order` is re-sequenced. */
export function deleteNavGroup(prev: PortfolioData, groupId: string): PortfolioData {
  const remaining = (prev.navGroups ?? []).filter((g) => g.id !== groupId);
  const navGroups = [...remaining].sort((a, b) => a.order - b.order).map((g, i) => ({ ...g, order: i }));
  return {
    ...prev,
    navGroups,
    widgets: prev.widgets.map((w) => (w.groupId === groupId ? { ...w, groupId: undefined } : w)),
  };
}

/** Moves a widget into a different section (or ungroups it, when `groupId` is `undefined`).
 *  Clears the widget's stored `grid` so it re-auto-places inside its new section's contiguous
 *  block on the next render instead of keeping a stale position from its old context. */
export function assignWidgetGroup(prev: PortfolioData, widgetKey: string, groupId: string | undefined): PortfolioData {
  return {
    ...prev,
    widgets: prev.widgets.map((w) => (w.key === widgetKey ? { ...w, groupId, grid: undefined } : w)),
  };
}

/** Runs once, only when `navGroups` has never been initialized (`undefined` — not an empty
 *  array the user intentionally cleared down to zero): auto-creates one nav section per
 *  distinct content section among the current widgets, named via the same `sectionLabel` the
 *  sidebar/drawer already use, and assigns each matching widget into it. Without this, an
 *  existing portfolio would silently lose all its header links the moment this feature ships —
 *  instead the user sees their current auto-derived sections pre-populated and can
 *  rename/reorder/hide/regroup from there. */
export function seedDefaultNavGroups(prev: PortfolioData): PortfolioData {
  if (prev.navGroups !== undefined) return prev;

  const ordered = [...prev.widgets].sort((a, b) => a.order - b.order);
  const sections: string[] = [];
  for (const w of ordered) {
    const section = widgetSection(w.key);
    if (section && !sections.includes(section)) sections.push(section);
  }
  if (sections.length === 0) return { ...prev, navGroups: [] };

  const idBySection = new Map(sections.map((section) => [section, crypto.randomUUID()]));
  const navGroups: NavGroup[] = sections.map((section, i) => ({
    id: idBySection.get(section)!,
    name: sectionLabel(section),
    order: i,
    showInNav: true,
  }));
  const widgets = prev.widgets.map((w) => {
    const groupId = idBySection.get(widgetSection(w.key) ?? "");
    return groupId ? { ...w, groupId } : w;
  });
  return { ...prev, navGroups, widgets };
}
