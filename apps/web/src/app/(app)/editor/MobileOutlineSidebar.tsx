"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import type { NavGroup, WidgetInstance } from "@portfolio/schema";
import { listWidgets } from "@portfolio/widgets";
import { sectionIcon, sectionColor, sectionLabel } from "./sectionMeta";

const UNGROUPED_ID = "__ungrouped__";

interface MobileOutlineSidebarProps {
  widgets: WidgetInstance[];
  navGroups: NavGroup[];
  onToggleMobileVisible: (key: string) => void;
  onReorder: (orderedKeys: string[]) => void;
}

interface Bucket {
  id: string;
  name: string;
  keys: string[];
}

/**
 * Mobile-only Outline sidebar: reorder + show/hide, no position/size — mobile always renders
 * single-column (see the `@container` mobile breakpoint in globals.css), so a 2D grid editor
 * like the desktop OutlineSidebar's react-grid-layout has nothing meaningful to offer here.
 * Sections themselves (create/rename/delete/reorder) stay a desktop-only concern — shared
 * structure, not per-breakpoint — so each section here is a read-only grouping label with a
 * simple vertically-sortable list of its widgets beneath it; dragging never crosses a section
 * boundary, matching the "reorder + show/hide only" scope.
 */
export function MobileOutlineSidebar({
  widgets,
  navGroups,
  onToggleMobileVisible,
  onReorder,
}: MobileOutlineSidebarProps) {
  const allWidgetDefs = listWidgets();
  const orderedGroups = [...navGroups].sort((a, b) => a.order - b.order);
  const validGroupIds = new Set(orderedGroups.map((g) => g.id));

  const mobileOrder = (w: WidgetInstance) => w.mobileOrder ?? w.order;
  const groupIdFor = (w: WidgetInstance): string | undefined =>
    w.groupId && validGroupIds.has(w.groupId) ? w.groupId : undefined;

  const buckets: Bucket[] = [
    ...orderedGroups.map((g) => ({
      id: g.id,
      name: g.name,
      keys: widgets
        .filter((w) => groupIdFor(w) === g.id)
        .sort((a, b) => mobileOrder(a) - mobileOrder(b))
        .map((w) => w.key),
    })),
    {
      id: UNGROUPED_ID,
      name: "Ungrouped",
      keys: widgets
        .filter((w) => groupIdFor(w) === undefined)
        .sort((a, b) => mobileOrder(a) - mobileOrder(b))
        .map((w) => w.key),
    },
  ].filter((b) => b.keys.length > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // Keyboard support (Tab to the handle, Space to pick up, arrow keys to move, Space to drop)
    // — a real accessibility requirement for drag-to-reorder, not just a pointer-only affordance.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(bucket: Bucket) {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = bucket.keys.indexOf(String(active.id));
      const newIndex = bucket.keys.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const reorderedBucketKeys = arrayMove(bucket.keys, oldIndex, newIndex);
      // `mobileOrder` is one flat number across the whole portfolio (same convention as
      // desktop's `order`) — re-flatten every bucket (in their existing order) with just this
      // one bucket's keys swapped for its new sequence.
      const allKeys = buckets.flatMap((b) => (b.id === bucket.id ? reorderedBucketKeys : b.keys));
      onReorder(allKeys);
    };
  }

  if (buckets.length === 0) {
    return <p className="text-xs text-muted-foreground px-1">No sections yet — add one from the Widget Drawer.</p>;
  }

  return (
    <div className="outline-grid-wrapper">
      {buckets.map((bucket) => (
        <div key={bucket.id} className="outline-section">
          <div className="outline-section-header outline-section-header--ungrouped">
            <span className="outline-section-name-input outline-section-name-input--static">{bucket.name}</span>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragEnd={handleDragEnd(bucket)}
          >
            <SortableContext items={bucket.keys} strategy={verticalListSortingStrategy}>
              <div className="mobile-outline-list">
                {bucket.keys.map((key) => {
                  const instance = widgets.find((w) => w.key === key);
                  if (!instance) return null;
                  const def = allWidgetDefs.find((w) => w.manifest.key === instance.key);
                  const section = def?.manifest.section ?? instance.key;
                  const label = def?.manifest.label ?? sectionLabel(section);
                  const visible = instance.mobileVisible ?? instance.visible;
                  return (
                    <MobileOutlineRow
                      key={key}
                      id={key}
                      label={label}
                      section={section}
                      visible={visible}
                      onToggleVisible={() => onToggleMobileVisible(key)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ))}
    </div>
  );
}

function MobileOutlineRow({
  id,
  label,
  section,
  visible,
  onToggleVisible,
}: {
  id: string;
  label: string;
  section: string;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const Icon = sectionIcon(section);
  const color = sectionColor(section);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mobile-outline-row${!visible ? " mobile-outline-row--disabled" : ""}`}
    >
      <button
        type="button"
        className="mobile-outline-row-handle"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
      >
        <GripVertical size={13} />
      </button>
      <span className="outline-card-icon" style={{ backgroundColor: `${color}22`, color }}>
        <Icon size={14} />
      </span>
      <span className="mobile-outline-row-label">{label}</span>
      <button
        type="button"
        className="mobile-outline-row-eye"
        onClick={onToggleVisible}
        title={visible ? "Shown on mobile — click to hide" : "Hidden on mobile — click to show"}
      >
        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
    </div>
  );
}
