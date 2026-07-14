import type { CSSProperties } from "react";
import { resolveGridLayout, type PortfolioData } from "@portfolio/schema";
import { getTheme, DEFAULT_THEME_ID, type ThemeSlot } from "@portfolio/themes";
import { getWidget } from "@portfolio/widgets";
import { ErrorBoundary } from "@portfolio/ui-kit";

function ProfileOnlyFallback({ data }: { data: PortfolioData }) {
  return (
    <div className="theme-degraded-notice">
      <h1>{data.profile.name || "Portfolio"}</h1>
      {data.profile.headline && <p>{data.profile.headline}</p>}
      <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Some sections couldn&apos;t be displayed.</p>
    </div>
  );
}

export interface PortfolioRendererProps {
  data: PortfolioData;
}

/**
 * The single render function imported by BOTH the editor's live preview and the public
 * `/[username]` page — this is what guarantees WYSIWYG (edge_case.md §3) instead of the two
 * surfaces drifting apart. Also the one place that implements: theme/palette fallback on a
 * missing/stale id, skipping unknown widget keys with a warning instead of crashing, and
 * wrapping every widget AND the theme shell in its own error boundary so one broken component
 * degrades gracefully (edge_case.md §2). Widgets are theme-agnostic — every registered widget
 * renders under every theme, there is no "supported by this theme" restriction.
 *
 * Every widget lives in one continuous 2-column grid (see `resolveGridLayout`), assembled here
 * into a single synthetic "grid-root" ThemeSlot — themes never need their own grid CSS or any
 * awareness that a layout system exists at all; each theme's existing `slots.map(...)` loop just
 * renders this one slot exactly like it renders any other. Row height is `auto` (sized to each
 * row's tallest member), so nothing inside the portfolio ever needs its own scrollbar. Every
 * widget always gets an id'd anchor div (`#portfolio-section-{key}`), used by both the editor's
 * Outline scroll-to-section AND any theme that builds its own section nav links (e.g.
 * animated-motion) — on the public page too, not just in the editor.
 */
export function PortfolioRenderer({ data }: PortfolioRendererProps) {
  const theme = getTheme(data.themeId) ?? getTheme(DEFAULT_THEME_ID);
  if (!theme) {
    // Both the requested theme AND the default are missing from the registry — should never
    // happen, but degrade to a bare profile rather than throwing.
    return <ProfileOnlyFallback data={data} />;
  }

  const palette = theme.manifest.palettes.includes(data.palette) ? data.palette : theme.manifest.defaultPalette;

  const visibleWidgets = data.widgets.filter((w) => w.visible);
  const placements = resolveGridLayout(visibleWidgets, data.navGroups ?? [], (key) => getWidget(key)?.manifest.lockedWidth === true);

  const gridItems = placements.flatMap(({ key, x, y, w, h }) => {
    const instance = visibleWidgets.find((v) => v.key === key);
    const widget = instance && getWidget(instance.key);
    if (!instance || !widget) {
      if (instance) console.warn(`Unknown widget key "${instance.key}" — skipping`);
      return [];
    }
    const WidgetComponent = widget.Component;
    const content = (
      <ErrorBoundary key={key} fallback={null}>
        <WidgetComponent data={data} config={instance.config} instanceKey={key} />
      </ErrorBoundary>
    );
    const inner = (
      <div id={`portfolio-section-${key}`} data-widget-key={key}>
        {content}
      </div>
    );
    // `--w-order` drives this item's position in the MOBILE (single-column) view via the
    // `order` CSS property (see the `@container` mobile breakpoint in globals.css) — falls back
    // to the desktop `order` until the user explicitly customizes mobile order. Desktop's own
    // gridColumn/gridRow below is untouched; mobile visibility is a separate `data-` attribute
    // since `mobileVisible === false` must hide a widget on mobile without removing it from the
    // desktop grid it's still occupying here.
    const mobileHidden = instance.mobileVisible === false;
    return [
      <div
        key={key}
        className="theme-widget-grid-item"
        data-mobile-hidden={mobileHidden ? "true" : undefined}
        style={
          {
            gridColumn: `${x + 1} / span ${w}`,
            gridRow: `${y + 1} / span ${h}`,
            "--w-order": instance.mobileOrder ?? instance.order,
          } as CSSProperties
        }
      >
        {inner}
      </div>,
    ];
  });

  // Widgets hidden on desktop (`visible: false`, so already excluded from `visibleWidgets` and
  // `resolveGridLayout`'s bin-packing above) but explicitly shown on mobile — never consume
  // desktop grid space; rendered as extra items, `display:none` by default, only revealed by the
  // same mobile `@container` breakpoint (see `.theme-widget-grid-item--mobile-only` in globals.css).
  const mobileOnlyItems = data.widgets
    .filter((w) => !w.visible && w.mobileVisible === true)
    .flatMap((instance) => {
      const widget = getWidget(instance.key);
      if (!widget) return [];
      const WidgetComponent = widget.Component;
      return [
        <div
          key={instance.key}
          className="theme-widget-grid-item theme-widget-grid-item--mobile-only"
          style={{ "--w-order": instance.mobileOrder ?? instance.order } as CSSProperties}
        >
          <div id={`portfolio-section-${instance.key}`} data-widget-key={instance.key}>
            <ErrorBoundary fallback={null}>
              <WidgetComponent data={data} config={instance.config} instanceKey={instance.key} />
            </ErrorBoundary>
          </div>
        </div>,
      ];
    });

  const allGridItems = [...gridItems, ...mobileOnlyItems];
  const slots: ThemeSlot[] =
    allGridItems.length === 0 ? [] : [{ key: "grid-root", node: <div className="theme-widget-grid">{allGridItems}</div> }];

  const ThemeComponent = theme.Component;

  return (
    <ErrorBoundary fallback={<ProfileOnlyFallback data={data} />}>
      <ThemeComponent data={data} palette={palette} slots={slots} />
    </ErrorBoundary>
  );
}
