"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Eye, EyeOff, GripVertical, X } from "lucide-react";
import { resolveGridLayout, type NavGroup, type ResolvedGridItem, type WidgetInstance } from "@portfolio/schema";
import { listWidgets } from "@portfolio/widgets";
import { sectionIcon, sectionColor, sectionLabel } from "./sectionMeta";
import type { GridPositionUpdate } from "./sectionOps";

const ResizableGridLayout = GridLayout.WidthProvider(GridLayout);

// Not exported by @types/react-grid-layout despite being part of its public prop surface.
type ResizeHandle = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne";

const UNGROUPED_ID = "__ungrouped__";

type WidgetDef = ReturnType<typeof listWidgets>[number];

interface OutlineSidebarProps {
  widgets: WidgetInstance[];
  navGroups: NavGroup[];
  onToggleVisible: (key: string) => void;
  onLayoutChange: (positions: GridPositionUpdate[]) => void;
  onRemoveWidget: (key: string) => void;
  /** Lets the parent temporarily relax its own overflow clipping while a card is being dragged,
   *  so a card dragged out of this sidebar's bounds is actually visible outside it rather than
   *  clipped by an ancestor's `overflow-y-auto`. */
  onDraggingChange?: (dragging: boolean) => void;
  onCreateGroup: () => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onToggleGroupVisible: (groupId: string) => void;
  onReorderGroup: (draggedGroupId: string, targetGroupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAssignGroup: (widgetKey: string, groupId: string | undefined) => void;
}

interface RGLLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  resizeHandles?: ResizeHandle[];
}

interface Bucket {
  id: string;
  group: NavGroup | null;
  placements: ResolvedGridItem[];
}

/**
 * Resize-handle constraints for one widget: `manifest.sizes`, when present, is the authoritative
 * source (min/max of each dimension across every footprint the widget actually has a designed
 * rendering for) — this is what stops the resize handle from ever reaching an undesigned
 * footprint. Heights between designed variants ARE reachable (the widget renders its nearest
 * designed variant; rows are auto-height so intermediate `h` is organizational, not a pixel
 * height), but never beyond the native footprint's `maxH`. `lockedWidth` remains a stronger,
 * independent constraint (width pinned to 2 regardless of what `sizes` says, since a locked
 * widget's internal layout can't narrow at all). Absent `sizes` falls back to the pre-`sizes`
 * behavior: any height up to 2, width free unless locked.
 */
function widgetSizeConstraints(def: WidgetDef | undefined): {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
} {
  const locked = def?.manifest.lockedWidth === true;
  const sizes = def?.manifest.sizes;
  if (sizes && sizes.length > 0) {
    // "WxH" — split, don't index by character position: H can be two digits ("2x10").
    const ws = sizes.map((s) => Number(s.split("x")[0]));
    const hs = sizes.map((s) => Number(s.split("x")[1]));
    return {
      minW: locked ? 2 : Math.min(...ws),
      maxW: locked ? 2 : Math.max(...ws),
      minH: Math.min(...hs),
      maxH: Math.max(...hs),
    };
  }
  return { minW: locked ? 2 : 1, maxW: 2, minH: 1, maxH: 2 };
}

/** Finds the (other) section whose wrapper bounds currently contain a point — the mechanism
 *  behind dragging a card from one section's grid into a different one, since react-grid-layout
 *  has no native concept of dragging an item between separate grid instances. */
function findHoveredOtherSection(
  clientX: number,
  clientY: number,
  sectionRefs: Map<string, HTMLDivElement>,
  ownId: string
): string | null {
  for (const [id, el] of sectionRefs) {
    if (id === ownId) continue;
    const r = el.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return id;
  }
  return null;
}

/**
 * The portfolio's whole layout, edited directly: widgets are grouped into user-named "sections"
 * (real visual groups, each its own mini-grid — not just tags), each sized 1x1/1x2/2x1/2x2 by
 * dragging its edge, and repositioned by dragging the card itself within its section — or moved
 * to a *different* section by dragging it over that section's block. Sections are what a theme's
 * nav header is built from (see AnimatedMotionComponent) — a widget with no section never
 * appears in the header, and a section can be hidden from the header independently of its
 * widgets' own visibility.
 *
 * All of a section's members are made contiguous in the *shared* grid coordinate space by
 * `resolveGridLayout` itself (sorted primarily by group order, see @portfolio/schema/widget.ts) —
 * this component just slices that one resolved array into per-group buckets and renders each as
 * its own react-grid-layout instance, rebasing that bucket's rows to a local 0-based origin (RGL
 * needs its own origin per instance) and un-rebasing back to the global row before persisting.
 */
export function OutlineSidebar({
  widgets,
  navGroups,
  onToggleVisible,
  onLayoutChange,
  onRemoveWidget,
  onDraggingChange,
  onCreateGroup,
  onRenameGroup,
  onToggleGroupVisible,
  onReorderGroup,
  onDeleteGroup,
  onAssignGroup,
}: OutlineSidebarProps) {
  const allWidgetDefs = listWidgets();
  const isLockedWidth = (key: string) =>
    allWidgetDefs.find((w) => w.manifest.key === key)?.manifest.lockedWidth === true;
  const orderedGroups = [...navGroups].sort((a, b) => a.order - b.order);
  const placements = resolveGridLayout(widgets, orderedGroups, isLockedWidth);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef(new Map<string, HTMLDivElement>());
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [draggingActive, setDraggingActive] = useState(false);
  // Native HTML5 drag-and-drop for reordering whole sections (grab a section's handle, drop it
  // on another section) — distinct from `dragOverSectionId` above, which tracks widget cards
  // being dragged between sections via react-grid-layout's mouse-position-based drag.
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
  const [groupDropTargetId, setGroupDropTargetId] = useState<string | null>(null);

  const handleDraggingChange = useCallback(
    (dragging: boolean) => {
      setDraggingActive(dragging);
      onDraggingChange?.(dragging);
    },
    [onDraggingChange]
  );

  const handleDropOnSection = useCallback(
    (widgetKey: string, targetSectionId: string) => {
      setDragOverSectionId(null);
      onAssignGroup(widgetKey, targetSectionId === UNGROUPED_ID ? undefined : targetSectionId);
    },
    [onAssignGroup]
  );

  const validGroupIds = new Set(orderedGroups.map((g) => g.id));
  const groupIdFor = (key: string): string | undefined => {
    const gid = widgets.find((w) => w.key === key)?.groupId;
    return gid && validGroupIds.has(gid) ? gid : undefined;
  };

  const buckets: Bucket[] = [
    ...orderedGroups.map((group) => ({
      id: group.id,
      group,
      placements: placements.filter((p) => groupIdFor(p.key) === group.id),
    })),
    {
      id: UNGROUPED_ID,
      group: null,
      placements: placements.filter((p) => groupIdFor(p.key) === undefined),
    },
  ];

  // Auto-focus a freshly-created section's name input so the user can rename it immediately.
  const nameInputRefs = useRef(new Map<string, HTMLInputElement>());
  const prevGroupCount = useRef(navGroups.length);
  useEffect(() => {
    if (navGroups.length > prevGroupCount.current) {
      const last = orderedGroups[orderedGroups.length - 1];
      const el = last && nameInputRefs.current.get(last.id);
      el?.focus();
      el?.select();
    }
    prevGroupCount.current = navGroups.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navGroups.length]);

  if (placements.length === 0) {
    return <p className="text-xs text-muted-foreground px-1">No sections yet — add one from the Widget Drawer.</p>;
  }

  return (
    <div ref={containerRef} className="outline-grid-wrapper">
      <button type="button" className="outline-new-section-btn" onClick={onCreateGroup} title="Add a new section">
        + Section
      </button>
      {buckets.map((bucket) => (
        <div
          key={bucket.id}
          ref={(el) => {
            if (el) sectionRefs.current.set(bucket.id, el);
            else sectionRefs.current.delete(bucket.id);
          }}
          className={`outline-section${
            bucket.id === dragOverSectionId || bucket.group?.id === groupDropTargetId ? " outline-section--drop-target" : ""
          }`}
          onDragOver={(e) => {
            if (!bucket.group || !draggedGroupId || draggedGroupId === bucket.group.id) return;
            e.preventDefault();
            setGroupDropTargetId(bucket.group.id);
          }}
          onDragLeave={() => {
            setGroupDropTargetId((id) => (id === bucket.group?.id ? null : id));
          }}
          onDrop={(e) => {
            if (!bucket.group || !draggedGroupId) return;
            e.preventDefault();
            onReorderGroup(draggedGroupId, bucket.group.id);
            setDraggedGroupId(null);
            setGroupDropTargetId(null);
          }}
        >
          {bucket.group ? (
            <div className="outline-section-header">
              <button
                type="button"
                className="outline-section-drag-handle"
                draggable
                onDragStart={(e) => {
                  setDraggedGroupId(bucket.group!.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  setDraggedGroupId(null);
                  setGroupDropTargetId(null);
                }}
                title="Drag to reorder this section"
              >
                <GripVertical size={13} />
              </button>
              <input
                ref={(el) => {
                  if (el) nameInputRefs.current.set(bucket.group!.id, el);
                  else nameInputRefs.current.delete(bucket.group!.id);
                }}
                className="outline-section-name-input"
                value={bucket.group.name}
                onChange={(e) => onRenameGroup(bucket.group!.id, e.target.value)}
                aria-label="Section name"
              />
              <button
                type="button"
                className="outline-section-eye-btn"
                onClick={() => onToggleGroupVisible(bucket.group!.id)}
                title={
                  bucket.group.showInNav
                    ? "Showing in the theme header — click to hide this link"
                    : "Hidden from the theme header — click to show this link"
                }
              >
                {bucket.group.showInNav ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <div className="outline-section-controls-extra">
                <button
                  type="button"
                  onClick={() => onDeleteGroup(bucket.group!.id)}
                  title="Delete section — its widgets stay, just ungrouped"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="outline-section-header outline-section-header--ungrouped">
              <span className="outline-section-name-input outline-section-name-input--static">Ungrouped</span>
            </div>
          )}

          {bucket.placements.length > 0 ? (
            <OutlineSectionGrid
              placements={bucket.placements}
              widgets={widgets}
              allWidgetDefs={allWidgetDefs}
              sectionId={bucket.id}
              sectionRefs={sectionRefs}
              containerRef={containerRef}
              onToggleVisible={onToggleVisible}
              onRemoveWidget={onRemoveWidget}
              onLayoutChange={onLayoutChange}
              onDraggingChange={handleDraggingChange}
              onDragOverSection={setDragOverSectionId}
              onDropOnSection={handleDropOnSection}
            />
          ) : (
            draggingActive && <div className="outline-section-drop-hint">Drop here</div>
          )}
        </div>
      ))}
    </div>
  );
}

interface OutlineSectionGridProps {
  /** This bucket's subset of the one globally-resolved placement array — coordinates are in the
   *  shared/global row space, rebased to a local origin only for this RGL instance's own props. */
  placements: ResolvedGridItem[];
  widgets: WidgetInstance[];
  allWidgetDefs: WidgetDef[];
  sectionId: string;
  sectionRefs: MutableRefObject<Map<string, HTMLDivElement>>;
  containerRef: RefObject<HTMLDivElement | null>;
  onToggleVisible: (key: string) => void;
  onRemoveWidget: (key: string) => void;
  onLayoutChange: (positions: GridPositionUpdate[]) => void;
  onDraggingChange?: (dragging: boolean) => void;
  onDragOverSection: (id: string | null) => void;
  onDropOnSection: (widgetKey: string, targetSectionId: string) => void;
}

function OutlineSectionGrid({
  placements,
  widgets,
  allWidgetDefs,
  sectionId,
  sectionRefs,
  containerRef,
  onToggleVisible,
  onRemoveWidget,
  onLayoutChange,
  onDraggingChange,
  onDragOverSection,
  onDropOnSection,
}: OutlineSectionGridProps) {
  const minY = Math.min(...placements.map((p) => p.y));
  const dragStart = useRef<{ i: string; x: number; y: number } | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  // Set right before a cross-section reassignment fires, so the very next onLayoutChange (RGL
  // always fires one right after onDragStop, even for a drag that's "leaving" this section) skips
  // persisting a position for that widget — it's no longer this section's to position.
  const suppressNextLayoutKey = useRef<string | null>(null);

  const layout: RGLLayoutItem[] = placements.map((p) => {
    const def = allWidgetDefs.find((w) => w.manifest.key === p.key);
    const { minW, maxW, minH, maxH } = widgetSizeConstraints(def);
    return {
      i: p.key,
      x: p.x,
      y: p.y - minY,
      w: p.w,
      h: p.h,
      minW,
      maxW,
      minH,
      maxH,
      resizeHandles: ["se"],
    };
  });

  const handleDragStart = useCallback(
    (_layout: RGLLayoutItem[], oldItem: RGLLayoutItem) => {
      dragStart.current = { i: oldItem.i, x: oldItem.x, y: oldItem.y };
      onDraggingChange?.(true);
    },
    [onDraggingChange]
  );

  const handleDrag = useCallback(
    (
      _layout: RGLLayoutItem[],
      _oldItem: RGLLayoutItem,
      newItem: RGLLayoutItem,
      _placeholder: RGLLayoutItem,
      event: MouseEvent
    ) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const outsideSidebar =
        !!rect &&
        (event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom);
      if (outsideSidebar) {
        setDeleteCandidate(newItem.i);
        onDragOverSection(null);
        return;
      }
      setDeleteCandidate(null);
      onDragOverSection(findHoveredOtherSection(event.clientX, event.clientY, sectionRefs.current, sectionId));
    },
    [containerRef, sectionRefs, sectionId, onDragOverSection]
  );

  const handleDragStop = useCallback(
    (
      _layout: RGLLayoutItem[],
      _oldItem: RGLLayoutItem,
      newItem: RGLLayoutItem,
      _placeholder: RGLLayoutItem,
      event: MouseEvent
    ) => {
      const start = dragStart.current;
      dragStart.current = null;
      onDraggingChange?.(false);
      onDragOverSection(null);

      if (deleteCandidate === newItem.i) {
        setDeleteCandidate(null);
        onRemoveWidget(newItem.i);
        return;
      }

      const targetSection = findHoveredOtherSection(event.clientX, event.clientY, sectionRefs.current, sectionId);
      if (targetSection) {
        suppressNextLayoutKey.current = newItem.i;
        onDropOnSection(newItem.i, targetSection);
        return;
      }

      if (start && start.i === newItem.i && start.x === newItem.x && start.y === newItem.y) {
        onToggleVisible(newItem.i);
      }
    },
    [deleteCandidate, onDraggingChange, onDragOverSection, onDropOnSection, onRemoveWidget, onToggleVisible, sectionRefs, sectionId]
  );

  const handleLayoutChange = useCallback(
    (newLayout: RGLLayoutItem[]) => {
      const suppressed = suppressNextLayoutKey.current;
      suppressNextLayoutKey.current = null;
      const positions = newLayout
        .filter((l) => l.i !== suppressed)
        .map((l) => ({ key: l.i, x: l.x, y: l.y + minY, w: l.w, h: l.h }));
      if (positions.length > 0) onLayoutChange(positions);
    },
    [onLayoutChange, minY]
  );

  return (
    <ResizableGridLayout
      className="outline-grid no-scrollbar"
      layout={layout}
      cols={2}
      rowHeight={52}
      margin={[8, 8]}
      compactType={null}
      preventCollision={false}
      resizeHandles={["se"]}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onLayoutChange={handleLayoutChange}
    >
      {placements.map((p) => {
        const instance = widgets.find((w) => w.key === p.key);
        if (!instance) return null;
        const def = allWidgetDefs.find((w) => w.manifest.key === instance.key);
        const section = def?.manifest.section ?? instance.key;
        const Icon = sectionIcon(section);
        const color = sectionColor(section);
        const label = def?.manifest.label ?? sectionLabel(section);
        const pendingDelete = deleteCandidate === p.key;
        return (
          <div
            key={p.key}
            className={`outline-card${!instance.visible ? " outline-card--disabled" : ""}${pendingDelete ? " outline-card--delete-pending" : ""}`}
            title={
              pendingDelete
                ? `Drop to remove ${label} permanently`
                : instance.visible
                  ? `${label} — click to hide, drag to resize/move/reassign to another section`
                  : `${label} — click to show, drag to resize/move/reassign to another section`
            }
          >
            <span className="outline-card-icon" style={{ backgroundColor: `${color}22`, color }}>
              <Icon size={14} />
            </span>
            <span className="outline-card-label">{label}</span>
            {/* Purely decorative — hover affordance only. Real resizing only ever happens via
                the bottom-right react-resizable handle (see the resizeHandles comment above). */}
            <span className="outline-card-corner outline-card-corner--nw" aria-hidden="true" />
            <span className="outline-card-corner outline-card-corner--ne" aria-hidden="true" />
            <span className="outline-card-corner outline-card-corner--sw" aria-hidden="true" />
          </div>
        );
      })}
    </ResizableGridLayout>
  );
}
