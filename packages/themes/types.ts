import type { ReactNode, ComponentType } from "react";
import type { PortfolioData } from "@portfolio/schema";

export interface ThemeManifest {
  id: string;
  name: string;
  domainTags: string[];
  /** Section id -> widget key to auto-add the first time that section is used under this
   *  theme. Every registered widget is usable under every theme (themes are a rendering shell,
   *  widgets are theme-agnostic) — this only decides the *starting* style per section. */
  defaultWidgetKeys: Record<string, string>;
  palettes: string[];
  defaultPalette: string;
  isPremium: boolean;
  priceInPaise: number;
}

export interface ThemeSlot {
  key: string;
  node: ReactNode;
}

export interface ThemeProps {
  data: PortfolioData;
  palette: string;
  /**
   * Already filtered to widgets that are visible AND supported by this theme, sorted by the
   * user's chosen order, and individually error-boundary-wrapped by the shared render pipeline.
   * Themes render whatever is here — they never need to know about widgets they don't support,
   * and an empty array must still render fine (theme renders its own header regardless).
   */
  slots: ThemeSlot[];
}

export interface ThemeModule {
  manifest: ThemeManifest;
  Component: ComponentType<ThemeProps>;
  palettes: Record<string, Record<string, string>>;
}
