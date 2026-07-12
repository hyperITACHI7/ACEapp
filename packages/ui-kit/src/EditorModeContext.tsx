"use client";

import * as React from "react";
import type { PortfolioData } from "@portfolio/schema";

export interface EditorMode {
  editing: boolean;
  updateDraft: (updater: (prev: PortfolioData) => PortfolioData) => void;
  uploadImage: (file: File) => Promise<string>;
  /** Patches a specific widget instance's own `config` by its `data.widgets[]` key — for
   *  widgets (like Stats/Quote) whose content lives entirely in `config` rather than a
   *  dedicated PortfolioData field. */
  updateWidgetConfig: (key: string, patch: Record<string, unknown>) => void;
}

const inertEditorMode: EditorMode = {
  editing: false,
  updateDraft: () => {},
  uploadImage: () => Promise.reject(new Error("uploadImage is not available outside the editor")),
  updateWidgetConfig: () => {},
};

export const EditorModeContext = React.createContext<EditorMode>(inertEditorMode);

export function useEditorMode(): EditorMode {
  return React.useContext(EditorModeContext);
}
