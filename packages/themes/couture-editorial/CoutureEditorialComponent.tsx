"use client";

import { useEffect, useState } from "react";
import { getWidget } from "@portfolio/widgets";
import type { ThemeProps } from "../types";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

/**
 * Root pattern copied from packages/themes/animated-motion/AnimatedMotionComponent.tsx: fixed
 * top nav that blurs in on scroll, nav links built from `data.navGroups` (never hardcoded section
 * ids — see `navEntries` below), a `theme-slot` per rendered widget, and a footer. No custom
 * cursor (the Fashion_folio reference this theme was extracted from has none) and no orb-style
 * ambient background — the reference's only ambient effect is a very subtle grain overlay
 * (`.theme-grain`, pure CSS, no JS needed).
 */
export function CoutureEditorialComponent({ data, palette, slots }: ThemeProps) {
  const vars = palettes[palette] ?? palettes[manifest.defaultPalette];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dormant-header rule (see _theme-template/index.tsx's amended doc comment): this theme's
  // blueprint ships a hero widget, so this fallback header normally never renders — but if the
  // user deletes it, this reappears rather than leaving a blank space above the nav.
  const hasHeroWidget = data.widgets.some(
    (w) => w.visible && getWidget(w.key)?.manifest.section === "hero"
  );

  const orderedWidgets = [...data.widgets].sort((a, b) => a.order - b.order);
  const navEntries = [...(data.navGroups ?? [])]
    .filter((g) => g.showInNav)
    .sort((a, b) => a.order - b.order)
    .flatMap((group) => {
      const member = orderedWidgets.find((w) => w.visible && w.groupId === group.id);
      return member ? [{ id: group.id, name: group.name, key: member.key }] : [];
    });

  return (
    <div className="theme theme-couture-editorial theme-grain" style={vars as React.CSSProperties}>
      <nav className={`theme-nav-couture${scrolled ? " theme-nav-couture--scrolled" : ""}`}>
        <div className="theme-nav-couture-inner">
          <a href="#portfolio-top" className="theme-nav-couture-logo">
            {data.profile.name || "Portfolio"}
          </a>
          {navEntries.length > 0 && (
            <ul className="theme-nav-couture-links">
              {navEntries.map((entry) => (
                <li key={entry.id}>
                  <a href={`#portfolio-section-${entry.key}`}>{entry.name}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {!hasHeroWidget && (
        <header id="portfolio-top" className="theme-header-couture">
          <h1 className="theme-name-couture">{data.profile.name || "Your Name"}</h1>
          <p className="theme-headline-couture">{data.profile.headline}</p>
        </header>
      )}

      <main id={hasHeroWidget ? "portfolio-top" : undefined} className="theme-body-couture">
        {slots.map((slot) => (
          <section key={slot.key} id={`portfolio-section-${slot.key}`} className="theme-slot-couture">
            {slot.node}
          </section>
        ))}
      </main>

      <footer className="theme-footer-couture">
        <div className="theme-footer-couture-inner">
          <span className="theme-footer-couture-logo">{data.profile.name || "Portfolio"}</span>
          {data.profile.headline && <span className="theme-footer-couture-tagline">{data.profile.headline}</span>}
          <span className="theme-footer-couture-copyright">
            © {new Date().getFullYear()} {data.profile.name || "Portfolio"}. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
