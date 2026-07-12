"use client";

import { useCallback, useRef, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { resolveGridLayout, type WidgetInstance } from "@portfolio/schema";
import { listWidgets } from "@portfolio/widgets";
import { sectionIcon, sectionColor, sectionLabel } from "./sectionMeta";
import type { GridPositionUpdate } from "./sectionOps";

const ResizableGridLayout = GridLayout.WidthProvider(GridLayout);

// Not exported by @types/react-grid-layout despite being part of its public prop surface.
type ResizeHandle = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne";

interface OutlineSidebarProps {
  widgets: WidgetInstance[];
  onToggleVisible: (key: string) => void;
  onLayoutChange: (positions: GridPositionUpdate[]) => void;
  onRemoveWidget: (key: string) => void;
  /** Lets the parent temporarily relax its own overflow clipping while a card is being dragged,
   *  so a card dragged out of this sidebar's bounds is actually visible outside it rather than
   *  clipped by an ancestor's `overflow-y-auto`. */
  onDraggingChange?: (dragging: boolean) => void;
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

/**
 * The portfolio's whole layout, edited directly: every section is a card sized 1x1/1x2/2x1/2x2
 * by dragging its edge, and repositioned by dragging the card itself — the same continuous 2
 * column grid the real portfolio renders (see resolveGridLayout / portfolioRenderer.tsx), just
 * shown here as plain icon+label cards instead of live widget content. A card's visibility
 * toggles by clicking it directly (no separate checkbox) — detected as a "drag" that ended
 * exactly where it started, rather than a raw DOM click, since a resizable/draggable element's
 * click handler can be unreliable once a drag library is attached to it.
 */
export function OutlineSidebar({
  widgets,
  onToggleVisible,
  onLayoutChange,
  onRemoveWidget,
  onDraggingChange,
}: OutlineSidebarProps) {
  const allWidgetDefs = listWidgets();
  const isLockedWidth = (key: string) =>
    allWidgetDefs.find((w) => w.manifest.key === key)?.manifest.lockedWidth === true;
  const placements = resolveGridLayout(widgets, isLockedWidth);
  const dragStart = useRef<{ i: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

  const layout: RGLLayoutItem[] = placements.map((p) => {
    const locked = isLockedWidth(p.key);
    return {
      i: p.key,
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      minW: locked ? 2 : 1,
      maxW: 2,
      minH: 1,
      maxH: 2,
      // react-grid-layout only resizes cleanly from the bottom-right corner — the item's own
      // (x, y) anchor never moves during a resize, so a "nw"/"ne"/"sw" handle would visibly grow
      // the card in the wrong direction relative to whichever corner was dragged. Only "se" is
      // ever a real drag target (see the 3 decorative corner marks in the render below); a
      // locked-width card still gets it since height stays adjustable even though width is
      // clamped back to 2 regardless of horizontal drag distance.
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
    (_layout: RGLLayoutItem[], _oldItem: RGLLayoutItem, newItem: RGLLayoutItem, _placeholder: RGLLayoutItem, event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const outside = !!rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
      setDeleteCandidate(outside ? newItem.i : null);
    },
    []
  );

  const handleDragStop = useCallback(
    (_layout: RGLLayoutItem[], _oldItem: RGLLayoutItem, newItem: RGLLayoutItem) => {
      const start = dragStart.current;
      dragStart.current = null;
      onDraggingChange?.(false);
      if (deleteCandidate === newItem.i) {
        setDeleteCandidate(null);
        onRemoveWidget(newItem.i);
        return;
      }
      if (start && start.i === newItem.i && start.x === newItem.x && start.y === newItem.y) {
        onToggleVisible(newItem.i);
      }
    },
    [deleteCandidate, onDraggingChange, onRemoveWidget, onToggleVisible]
  );

  const handleLayoutChange = useCallback(
    (newLayout: RGLLayoutItem[]) => {
      onLayoutChange(newLayout.map((l) => ({ key: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
    },
    [onLayoutChange]
  );

  if (placements.length === 0) {
    return <p className="text-xs text-muted-foreground px-1">No sections yet — add one from the Widget Drawer.</p>;
  }

  return (
    <div ref={containerRef} className="outline-grid-wrapper">
      <ResizableGridLayout
        className="outline-grid no-scrollbar"
        layout={layout}
        cols={2}
        rowHeight={60}
        margin={[8, 8]}
        compactType="vertical"
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
                    ? `${label} — click to hide`
                    : `${label} — click to show`
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
    </div>
  );
}
