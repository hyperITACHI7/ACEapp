"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { PortfolioData } from "@portfolio/schema";
import { getTheme } from "@portfolio/themes";
import { getWidget } from "@portfolio/widgets";
import { EditorModeContext, type EditorMode } from "@portfolio/ui-kit";
import { useOptimisticDraft } from "./useOptimisticDraft";
import { WidgetDrawer } from "./WidgetDrawer";
import { EditorCanvas } from "./EditorCanvas";
import { TopBar } from "./TopBar";
import { SettingsModal } from "./SettingsModal";
import { useWidgetActions } from "./useWidgetActions";
import { useThemeAndMediaActions } from "./useThemeAndMediaActions";
import { useNavGroupActions } from "./useNavGroupActions";
import { seedDefaultNavGroups } from "./sectionOps";

// react-grid-layout measures a real DOM width on mount and has no meaningful server-rendered
// output for an editor-only panel, so it's loaded client-side only.
const OutlineSidebar = dynamic(() => import("./OutlineSidebar").then((m) => m.OutlineSidebar), { ssr: false });
const MobileOutlineSidebar = dynamic(
  () => import("./MobileOutlineSidebar").then((m) => m.MobileOutlineSidebar),
  { ssr: false }
);

interface EditorClientProps {
  portfolioId: string;
  initialData: PortfolioData;
  initialVersion: number;
  published: boolean;
}

/** Ensures every section the current theme defaults to has an instance in `widgets` (appended,
 *  visible, at the end) — without this, a newly-switched-to theme's default sections would
 *  never appear since the shared renderer only draws from `data.widgets`. Sections the user
 *  already has (in ANY style, not necessarily the theme's default one) are left untouched. */
function normalizeWidgetsForTheme(data: PortfolioData): PortfolioData {
  const theme = getTheme(data.themeId);
  if (!theme) return data;
  const existingSections = new Set(
    data.widgets.map((w) => getWidget(w.key)?.manifest.section).filter((s): s is string => Boolean(s))
  );
  const missing = Object.entries(theme.manifest.defaultWidgetKeys).filter(
    ([section]) => !existingSections.has(section)
  );
  if (missing.length === 0) return data;
  const maxOrder = data.widgets.reduce((max, w) => Math.max(max, w.order), -1);
  const added = missing.map(([, key], i) => ({ key, order: maxOrder + 1 + i, visible: true, config: {} }));
  return { ...data, widgets: [...data.widgets, ...added] };
}

export function EditorClient({ portfolioId, initialData, initialVersion, published }: EditorClientProps) {
  const { draft, saving, updateDraft } = useOptimisticDraft(
    portfolioId,
    seedDefaultNavGroups(normalizeWidgetsForTheme(initialData)),
    initialVersion
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const [outlineDragging, setOutlineDragging] = useState(false);
  const [editingBreakpoint, setEditingBreakpoint] = useState<"desktop" | "mobile">("desktop");

  // Normalize whenever the theme changes so newly-supported slots appear immediately.
  useEffect(() => {
    updateDraft((prev) => normalizeWidgetsForTheme(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.themeId]);

  const {
    handleSectionSelect,
    handleToggleVisible,
    handleLayoutChange,
    handleRemoveWidget,
    handleMobileReorder,
    handleToggleMobileVisible,
  } = useWidgetActions(updateDraft);

  const {
    handleCreateGroup,
    handleRenameGroup,
    handleToggleGroupVisible,
    handleReorderGroup,
    handleDeleteGroup,
    handleAssignGroup,
  } = useNavGroupActions(updateDraft);

  const {
    uploadingPhoto,
    pendingPurchaseThemeId,
    setPendingPurchaseThemeId,
    applyThemeId,
    requestThemeChange,
    uploadImage,
    updateWidgetConfig,
    uploadPhoto,
    syncGithub,
  } = useThemeAndMediaActions(portfolioId, updateDraft);

  const editorMode = useMemo<EditorMode>(
    () => ({ editing: true, updateDraft, uploadImage, updateWidgetConfig }),
    [updateDraft, uploadImage, updateWidgetConfig]
  );

  return (
    // lg: the page is exactly viewport height (100vh minus MainBackground's p-6 = 3rem) so the
    // preview frame's bottom edge sits at the screen's bottom edge; each column scrolls
    // internally instead of the page. Below lg everything stacks and the page scrolls as before.
    <div className="flex flex-col gap-4 max-w-[1800px] mx-auto lg:h-[calc(100vh-3rem)]">
      <TopBar
        portfolioId={portfolioId}
        draft={draft}
        published={published}
        saving={saving}
        onOpenSettings={() => setSettingsOpen(true)}
        editingBreakpoint={editingBreakpoint}
        onEditingBreakpointChange={setEditingBreakpoint}
      />

      <div
        className={`grid grid-cols-1 gap-6 items-start lg:items-stretch lg:flex-1 lg:min-h-0 ${
          outlineCollapsed ? "lg:grid-cols-[40px_1fr_320px]" : "lg:grid-cols-[260px_1fr_320px]"
        }`}
      >
        <div
          className={`max-h-[85vh] lg:max-h-none lg:min-h-0 no-scrollbar ${outlineDragging ? "overflow-visible" : "overflow-y-auto"}`}
        >
          <button
            type="button"
            onClick={() => setOutlineCollapsed((v) => !v)}
            aria-label={outlineCollapsed ? "Expand outline panel" : "Collapse outline panel"}
            title={outlineCollapsed ? "Expand outline panel" : "Collapse outline panel"}
            className="mb-3 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            {outlineCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          {!outlineCollapsed &&
            (editingBreakpoint === "mobile" ? (
              <MobileOutlineSidebar
                widgets={draft.widgets}
                navGroups={draft.navGroups ?? []}
                onToggleMobileVisible={handleToggleMobileVisible}
                onReorder={handleMobileReorder}
              />
            ) : (
              <OutlineSidebar
                widgets={draft.widgets}
                navGroups={draft.navGroups ?? []}
                onToggleVisible={handleToggleVisible}
                onLayoutChange={handleLayoutChange}
                onRemoveWidget={handleRemoveWidget}
                onDraggingChange={setOutlineDragging}
                onCreateGroup={handleCreateGroup}
                onRenameGroup={handleRenameGroup}
                onToggleGroupVisible={handleToggleGroupVisible}
                onReorderGroup={handleReorderGroup}
                onDeleteGroup={handleDeleteGroup}
                onAssignGroup={handleAssignGroup}
              />
            ))}
        </div>

        {/* Neutral frame only — the rendered portfolio has its own independent theme
           palette and must not inherit this app's dark chrome. Desktop mode fills the page's
           full remaining height (grid stretch — bottom edge at the screen edge, width and
           therefore widget scale unchanged); mobile mode stays a fixed-ratio 9:16 phone frame.
           Both give the frame a real, definite CSS height, which is what makes the editor-only
           `cqh`-based sizing work (see .portfolio-canvas in globals.css). */}
        <EditorModeContext.Provider value={editorMode}>
          <div
            className={`rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden max-h-[85vh] lg:max-h-none overflow-y-auto no-scrollbar ${
              editingBreakpoint === "mobile"
                ? "lg:w-full lg:mx-auto lg:max-w-[420px] lg:aspect-[9/16] lg:self-start lg:max-h-full"
                : "lg:min-h-0"
            }`}
          >
            <EditorCanvas data={draft} />
          </div>
        </EditorModeContext.Provider>

        <div className="max-h-[85vh] lg:max-h-none lg:min-h-0 overflow-y-auto no-scrollbar">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            Widget Drawer
          </h3>
          <WidgetDrawer widgets={draft.widgets} onSelect={handleSectionSelect} />
        </div>
      </div>

      <SettingsModal
        portfolioId={portfolioId}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        draft={draft}
        updateDraft={updateDraft}
        uploadingPhoto={uploadingPhoto}
        onUploadPhoto={uploadPhoto}
        pendingPurchaseThemeId={pendingPurchaseThemeId}
        onRequestThemeChange={requestThemeChange}
        onApplyThemeId={applyThemeId}
        onPurchaseDone={() => setPendingPurchaseThemeId(null)}
        onSyncGithub={syncGithub}
      />
    </div>
  );
}
