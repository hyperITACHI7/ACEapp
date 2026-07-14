import { useCallback } from "react";
import type { PortfolioData } from "@portfolio/schema";
import {
  resolveSectionDrop,
  updateGridPositions,
  removeWidgetInstance,
  updateMobileOrder,
  toggleMobileVisible,
  type GridPositionUpdate,
} from "./sectionOps";

type UpdateDraft = (updater: (prev: PortfolioData) => PortfolioData) => void;

/** Handlers for widget/section-level editing: adding/swapping a section's style, toggling
 *  visibility, persisting a grid resize/reposition, and permanently removing a widget instance.
 *  All operate purely on `draft.widgets` via sectionOps.ts. */
export function useWidgetActions(updateDraft: UpdateDraft) {
  const handleSectionSelect = useCallback(
    (section: string, widgetKey: string) => {
      updateDraft((prev) => resolveSectionDrop(prev, section, widgetKey));
    },
    [updateDraft]
  );

  const handleToggleVisible = useCallback(
    (key: string) => {
      updateDraft((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) => (w.key === key ? { ...w, visible: !w.visible } : w)),
      }));
    },
    [updateDraft]
  );

  const handleLayoutChange = useCallback(
    (positions: GridPositionUpdate[]) => {
      updateDraft((prev) => updateGridPositions(prev, positions));
    },
    [updateDraft]
  );

  const handleRemoveWidget = useCallback(
    (key: string) => {
      updateDraft((prev) => removeWidgetInstance(prev, key));
    },
    [updateDraft]
  );

  const handleMobileReorder = useCallback(
    (orderedKeys: string[]) => {
      updateDraft((prev) => updateMobileOrder(prev, orderedKeys));
    },
    [updateDraft]
  );

  const handleToggleMobileVisible = useCallback(
    (key: string) => {
      updateDraft((prev) => toggleMobileVisible(prev, key));
    },
    [updateDraft]
  );

  return {
    handleSectionSelect,
    handleToggleVisible,
    handleLayoutChange,
    handleRemoveWidget,
    handleMobileReorder,
    handleToggleMobileVisible,
  };
}
