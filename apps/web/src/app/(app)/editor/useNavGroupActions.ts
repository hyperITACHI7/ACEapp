import { useCallback } from "react";
import type { PortfolioData } from "@portfolio/schema";
import {
  createNavGroup,
  renameNavGroup,
  toggleNavGroupVisible,
  reorderNavGroup,
  deleteNavGroup,
  assignWidgetGroup,
} from "./sectionOps";

type UpdateDraft = (updater: (prev: PortfolioData) => PortfolioData) => void;

/** Handlers for the Outline sidebar's user-named nav sections: creating, renaming, reordering,
 *  toggling a section's nav-header visibility, deleting a section (ungroups its widgets, never
 *  deletes them), and moving a widget between sections. */
export function useNavGroupActions(updateDraft: UpdateDraft) {
  const handleCreateGroup = useCallback(() => {
    updateDraft((prev) => createNavGroup(prev));
  }, [updateDraft]);

  const handleRenameGroup = useCallback(
    (groupId: string, name: string) => {
      updateDraft((prev) => renameNavGroup(prev, groupId, name));
    },
    [updateDraft]
  );

  const handleToggleGroupVisible = useCallback(
    (groupId: string) => {
      updateDraft((prev) => toggleNavGroupVisible(prev, groupId));
    },
    [updateDraft]
  );

  const handleReorderGroup = useCallback(
    (groupId: string, direction: "up" | "down") => {
      updateDraft((prev) => reorderNavGroup(prev, groupId, direction));
    },
    [updateDraft]
  );

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      updateDraft((prev) => deleteNavGroup(prev, groupId));
    },
    [updateDraft]
  );

  const handleAssignGroup = useCallback(
    (widgetKey: string, groupId: string | undefined) => {
      updateDraft((prev) => assignWidgetGroup(prev, widgetKey, groupId));
    },
    [updateDraft]
  );

  return {
    handleCreateGroup,
    handleRenameGroup,
    handleToggleGroupVisible,
    handleReorderGroup,
    handleDeleteGroup,
    handleAssignGroup,
  };
}
