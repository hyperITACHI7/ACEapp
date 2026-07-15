import type { ComponentType } from "react";
import type { PortfolioData } from "@portfolio/schema";

export interface WidgetConfigField {
  name: string;
  label: string;
  type: "text" | "boolean" | "number";
  default: string | boolean | number;
}

export interface WidgetManifest {
  key: string;
  label: string;
  section: string;
  configSchema: WidgetConfigField[];
  /** Always spans both grid columns — the user cannot resize this widget narrower than
   *  full-width (e.g. a widget with a fixed 2-column internal layout or a full-bleed ticker). */
  lockedWidth?: true;
  /** Theme id whose purchase unlocks this widget (widgets travel bundled with the template they
   *  were extracted from, but once unlocked are usable under ANY theme — widgets are always
   *  theme-agnostic at render time, this only gates access in the editor's widget drawer).
   *  Absent = core widget, free for everyone. Enforcement point (not yet implemented): the
   *  drawer should filter `listWidgets()` to `manifest.bundledWith === undefined ||
   *  ownedThemeIds.includes(manifest.bundledWith)`, with ownership from the existing
   *  `userOwnsTheme()` in apps/web/src/server/payments/ownership.ts (respects
   *  DEV_UNLOCK_ALL_THEMES). */
  bundledWith?: string;
  /** Which grid footprints this widget has a designed rendering for, as "WxH" strings with
   *  W ∈ {1,2} and H an integer row count (1 row ≈ 330px rendered desktop height; schema caps H
   *  at 12). The editor's resize handle is constrained to the min/max W and H across these
   *  entries, so the widget can be dragged between its designed footprints (intermediate heights
   *  render the nearest designed variant) but never beyond them. Authoring rule (enforced by
   *  validateRegistry): at most ONE entry — the native/reference footprint — may have H > 2;
   *  every alternate variant stays within 2x2. Absent = all of 1x1/1x2/2x1/2x2 allowed (legacy
   *  behavior, matches every pre-existing widget). `lockedWidth: true` remains supported
   *  independently and means "w is always 2"; the two flags may combine when a widget is both
   *  full-width-only and only supports one height. */
  sizes?: Array<`${1 | 2}x${number}`>;
}

export interface WidgetProps {
  data: PortfolioData;
  config: Record<string, unknown>;
  /** This instance's own key in `data.widgets[]` — lets a widget patch its own `config`
   *  via `EditorMode.updateWidgetConfig` without hardcoding/importing its own manifest key. */
  instanceKey: string;
}

export interface WidgetModule {
  manifest: WidgetManifest;
  Component: ComponentType<WidgetProps>;
}
