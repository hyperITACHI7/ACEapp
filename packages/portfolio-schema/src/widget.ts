import { z } from "zod";

// Every widget lives in one continuous 2-column grid running down the whole portfolio —
// `x` picks the column, `y` the row, `w`/`h` how many columns/rows it spans (1 or 2 each).
// `.optional()` on the parent field (not `.default()`) is deliberate: "entirely absent" is the
// meaningful backward-compatible value — every existing stored widget simply lacks this key and
// falls back to a deterministic full-width default (see `resolveGridLayout` below) until the
// user actually drags/resizes it in the editor, at which point it's persisted explicitly.
export const GridPlacementSchema = z.object({
  x: z.union([z.literal(0), z.literal(1)]),
  y: z.number().int().min(0),
  w: z.union([z.literal(1), z.literal(2)]),
  h: z.union([z.literal(1), z.literal(2)]),
});

export const WidgetInstanceSchema = z.object({
  key: z.string(),
  order: z.number().int(),
  visible: z.boolean().default(true),
  config: z.record(z.any()).default({}),
  grid: GridPlacementSchema.optional(),
  // Absent = ungrouped, same "absence is meaningful" convention as `grid` above — a widget with
  // no groupId never appears in a theme's nav header and sorts last (see `resolveGridLayout`).
  groupId: z.string().optional(),
});

export type GridPlacement = z.infer<typeof GridPlacementSchema>;
export type WidgetInstance = z.infer<typeof WidgetInstanceSchema>;

// A user-named, user-orderable grouping of widgets — purely organizational (Outline sidebar
// clustering) and nav-label-driving (a theme's header shows one link per group with
// `showInNav`), never a distinct widget-content type of its own.
export const NavGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().int(),
  showInNav: z.boolean().default(true),
});

export type NavGroup = z.infer<typeof NavGroupSchema>;

export interface ResolvedGridItem {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Every widget gets an explicit (x, y, w, h) in the shared 2-column grid: widgets that already
 * have `grid` keep it as-is; any widget without one is deterministically placed at the next
 * fully-free full-width row (in `order` sequence) — a simple first-fit bin-pack, not a general
 * layout solver, since a not-yet-touched widget is always the default full-width/1-row size.
 * This is the single source of truth both the renderer and the editor's grid-arranging sidebar
 * call, so a portfolio with no grid data at all renders exactly as it did before this feature
 * existed (each widget stacked full-width, one per row, in `order`).
 *
 * `isLockedWidth` (a closure over each widget's manifest, since this package can't depend on
 * `@portfolio/widgets` without an import cycle) forces a widget back to full-width even if a
 * narrower placement was previously stored — a widget locked *after* the user resized it snaps
 * back rather than staying stuck narrow.
 *
 * `navGroups` makes this group-aware: widgets are sorted primarily by their group's `order`
 * (ungrouped, or a dangling reference to a deleted group, always sorts last via `Infinity`) and
 * only secondarily by their own `order`. This is what makes a group's members land in
 * contiguous rows without a second coordinate system — both the Outline sidebar (which slices
 * this same result into per-group buckets) and the public renderer call this one function.
 */
export function resolveGridLayout(
  widgets: WidgetInstance[],
  navGroups: NavGroup[] = [],
  isLockedWidth?: (key: string) => boolean
): ResolvedGridItem[] {
  const groupOrder = (groupId: string | undefined): number => {
    if (!groupId) return Infinity;
    return navGroups.find((g) => g.id === groupId)?.order ?? Infinity;
  };

  const sorted = [...widgets].sort((a, b) => {
    const groupDelta = groupOrder(a.groupId) - groupOrder(b.groupId);
    return groupDelta !== 0 ? groupDelta : a.order - b.order;
  });
  const occupied = new Set<string>();

  const isFree = (x: number, y: number, w: number, h: number) => {
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        if (occupied.has(`${x + dx},${y + dy}`)) return false;
      }
    }
    return true;
  };
  const occupy = (x: number, y: number, w: number, h: number) => {
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) occupied.add(`${x + dx},${y + dy}`);
    }
  };
  const firstFit = (w: number, h: number): { x: number; y: number } => {
    for (let y = 0; ; y++) {
      for (let x = 0; x <= 2 - w; x++) {
        if (isFree(x, y, w, h)) return { x, y };
      }
    }
  };

  // Resolve each already-placed widget's effective grid first (forcing locked widgets to
  // full-width), then seed occupied cells from those resolved values — so not-yet-placed
  // widgets fill genuinely free gaps rather than overlapping them.
  const resolved = new Map<string, { x: number; y: number; w: number; h: number }>();
  for (const w of sorted) {
    if (!w.grid) continue;
    const locked = isLockedWidth?.(w.key) ?? false;
    resolved.set(w.key, {
      x: locked ? 0 : w.grid.x,
      y: w.grid.y,
      w: locked ? 2 : w.grid.w,
      h: w.grid.h,
    });
  }
  for (const w of sorted) {
    const r = resolved.get(w.key);
    if (r) occupy(r.x, r.y, r.w, r.h);
  }

  const result: ResolvedGridItem[] = [];
  for (const w of sorted) {
    const r = resolved.get(w.key);
    if (r) {
      result.push({ key: w.key, ...r });
    } else {
      const { x, y } = firstFit(2, 1);
      occupy(x, y, 2, 1);
      result.push({ key: w.key, x, y, w: 2, h: 1 });
    }
  }
  return result;
}
