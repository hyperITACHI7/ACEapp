import type { ReactNode, ComponentType } from "react";
import type { PortfolioData, GridPlacement, NavGroup, Profile } from "@portfolio/schema";

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

/** A complete starting portfolio for this theme — widgets with exact grid placements and
 *  pre-filled sample content, nav groups, and sample profile data, so a new portfolio opened
 *  with this theme looks exactly like the reference it was extracted from. Every field here is
 *  just a starting point the user then edits/replaces as their own; nothing about a blueprint
 *  is permanent or theme-locked. Consumed at both portfolio-seeding sites (see
 *  apps/web/src/app/api/portfolios/route.ts and .../api/onboarding/complete/route.ts): when
 *  present, deep-merged over `emptyPortfolioData(themeId, palette)` before the result is
 *  validated and persisted. Absent = today's behavior (empty portfolio, `defaultWidgetKeys`
 *  only), so every pre-existing theme is unaffected. */
export interface TemplateBlueprint {
  widgets: Array<{
    key: string;
    order: number;
    visible: boolean;
    config: Record<string, unknown>;
    grid?: GridPlacement;
    groupId?: string;
  }>;
  navGroups: NavGroup[];
  /** Sample name/headline/bio/photoUrl/location/socialLinks — a Partial since a blueprint only
   *  needs to override the fields it actually has sample content for. */
  profile?: Partial<Profile>;
  projects?: PortfolioData["projects"];
  experience?: PortfolioData["experience"];
  skills?: string[];
  /** Defaults to manifest.defaultPalette when omitted. */
  palette?: string;
}

export interface ThemeModule {
  manifest: ThemeManifest;
  Component: ComponentType<ThemeProps>;
  palettes: Record<string, Record<string, string>>;
  blueprint?: TemplateBlueprint;
}
