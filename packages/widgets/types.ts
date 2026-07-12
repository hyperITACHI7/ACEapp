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
