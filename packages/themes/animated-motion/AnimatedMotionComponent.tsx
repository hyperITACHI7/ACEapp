"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useEditorMode } from "@portfolio/ui-kit";
import { getWidget } from "@portfolio/widgets";
import type { ThemeProps } from "../types";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

function initialsFor(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return initials || "PB";
}

function RevealSlot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Oversized hero name, each letter rising in from below with a staggered delay. */
function AnimatedHeroName({ text }: { text: string }) {
  const letters = Array.from(text);
  return (
    <h1 className="theme-name theme-name--display">
      {letters.map((ch, i) => (
        <span key={i} className="theme-name-letter-wrap">
          <motion.span
            className="theme-name-letter"
            initial={{ opacity: 0, y: "110%" }}
            animate={{ opacity: 1, y: "0%" }}
            transition={{ duration: 0.65, delay: 0.55 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/** Three drifting radial-gradient orbs + a faint grid, all pure CSS keyframe animation. */
function AmbientBackground() {
  return (
    <div className="theme-ambient" aria-hidden="true">
      <div className="theme-ambient-orb theme-ambient-orb--a" />
      <div className="theme-ambient-orb theme-ambient-orb--b" />
      <div className="theme-ambient-orb theme-ambient-orb--c" />
      <div className="theme-ambient-grid" />
    </div>
  );
}

/**
 * Mouse-follow cursor: the outer wrapper uses `mix-blend-mode: difference` (inverts whatever
 * it overlaps) and is lerp-smoothed toward the real pointer position via rAF, rather than
 * snapping straight to it — both written directly to the DOM node's style so tracking never
 * triggers a React re-render. Grows over interactive elements via a delegated hover check.
 */
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: -300, y: -300 });
  const currentRef = useRef({ x: -300, y: -300 });

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    function onMove(e: MouseEvent) {
      targetRef.current = { x: e.clientX, y: e.clientY };
    }
    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const hoverable = target?.closest("a, button, input, textarea, select, [contenteditable='true']");
      dot!.classList.toggle("theme-cursor--hover", Boolean(hoverable));
    }

    let raf: number;
    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.x += (tgt.x - cur.x) * 0.15;
      cur.y += (tgt.y - cur.y) * 0.15;
      dot.style.left = `${cur.x}px`;
      dot.style.top = `${cur.y}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={dotRef} className="theme-cursor" aria-hidden="true">
      <div className="theme-cursor-dot" />
    </div>
  );
}

/** Tracks scroll position via a sentinel's `getBoundingClientRect()`, re-checked on every
 *  `scroll` event caught at the `document` in the capture phase — that catches scroll events
 *  from the window AND from any inner scrollable panel (the editor renders this theme inside
 *  its own scrollable canvas, not the window), since capture intercepts an event on its way
 *  down to the target regardless of whether the event itself bubbles.
 *
 *  (An earlier IntersectionObserver-based version passed a fresh ref-callback closure every
 *  render, which made React tear down and recreate the observer on every render — including
 *  the render the observer's own callback triggered — so `scrolled` never reliably stuck.) */
function useScrolledPastSentinel(): [boolean, (node: HTMLDivElement | null) => void] {
  const [scrolled, setScrolled] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function check() {
      const rect = nodeRef.current?.getBoundingClientRect();
      if (rect) setScrolled(rect.top < 0);
    }
    check();
    document.addEventListener("scroll", check, { passive: true, capture: true });
    return () => document.removeEventListener("scroll", check, { capture: true });
  }, []);

  const setSentinel = (node: HTMLDivElement | null) => {
    nodeRef.current = node;
  };

  return [scrolled, setSentinel];
}

export function AnimatedMotionComponent({ data, palette, slots }: ThemeProps) {
  const vars = palettes[palette] ?? palettes[manifest.defaultPalette];
  // The custom cursor and forced `cursor: none` are suppressed while editing so canvas
  // interactions (contentEditable carets, range sliders, file pickers) keep a native pointer.
  const { editing } = useEditorMode();
  const [scrolled, setSentinel] = useScrolledPastSentinel();
  const { profile } = data;

  // The nav header shows one link per user-named, nav-visible section (see NavGroupSchema in
  // @portfolio/schema and the Outline sidebar's section UI) — entirely user-defined, so an
  // untouched portfolio shows no header links at all until the user creates a section (or
  // `seedDefaultNavGroups` pre-populates sensible ones from existing widgets on first load).
  // Anchors still point at `#portfolio-section-{key}` (every widget always gets that id div,
  // see portfolioRenderer.tsx), just resolved via a section's first visible member now instead
  // of straight from `data.widgets`.
  const orderedWidgets = [...data.widgets].sort((a, b) => a.order - b.order);
  const navEntries = [...(data.navGroups ?? [])]
    .filter((g) => g.showInNav)
    .sort((a, b) => a.order - b.order)
    .flatMap((group) => {
      const member = orderedWidgets.find((w) => w.visible && w.groupId === group.id);
      return member ? [{ id: group.id, name: group.name, key: member.key }] : [];
    });

  // The hero CTAs are deliberately NOT derived from nav sections — they keep pointing at
  // whatever gallery/contact widget exists regardless of how (or whether) the user has set up
  // their nav sections yet.
  function firstVisibleKeyForSection(section: string): string | undefined {
    return orderedWidgets.find((w) => w.visible && getWidget(w.key)?.manifest.section === section)?.key;
  }
  const workKey = firstVisibleKeyForSection("gallery");
  const contactKey = firstVisibleKeyForSection("contact");

  return (
    <div
      className={`theme theme-animated-motion${editing ? "" : " theme-animated-motion--cursor"}`}
      style={vars as React.CSSProperties}
    >
      {!editing && <CustomCursor />}
      <AmbientBackground />
      <div ref={setSentinel} className="theme-scroll-sentinel" aria-hidden="true" />

      <nav className={`theme-nav theme-nav--animated${scrolled ? " theme-nav--scrolled" : ""}`}>
        <div className="theme-nav-inner">
          <a href="#animated-top" className="theme-nav-brand">
            {initialsFor(profile.name || "Portfolio")}
          </a>
          <div className="theme-nav-right">
            {navEntries.length > 0 && (
              <div className="theme-nav-links">
                {navEntries.map((entry) => (
                  <a key={entry.id} href={`#portfolio-section-${entry.key}`} className="theme-nav-link">
                    {entry.name}
                  </a>
                ))}
              </div>
            )}
            <div className="theme-nav-status">
              <span className="theme-nav-status-dot" />
              <span>Available</span>
            </div>
          </div>
        </div>
      </nav>

      <header id="animated-top" className="theme-header theme-header--animated">
        <div className="theme-header-inner">
          <motion.div
            className="theme-eyebrow theme-hero-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Portfolio · {new Date().getFullYear()}
          </motion.div>

          <AnimatedHeroName text={profile.name || "Your Name"} />

          <div className="theme-hero-row">
            {profile.headline && (
              <motion.p
                className="theme-headline--animated"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.2 }}
              >
                {profile.headline}
              </motion.p>
            )}
            <motion.div
              className="theme-hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.4 }}
            >
              {workKey && (
                <a href={`#portfolio-section-${workKey}`} className="theme-hero-btn theme-hero-btn--solid">
                  View Work
                </a>
              )}
              {contactKey && (
                <a href={`#portfolio-section-${contactKey}`} className="theme-hero-btn theme-hero-btn--outline">
                  Get in Touch
                </a>
              )}
            </motion.div>
          </div>

          <motion.div
            className="theme-scroll-cue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <span className="theme-scroll-cue-line" />
            <span>Scroll</span>
            <span className="theme-scroll-cue-arrow">↓</span>
          </motion.div>
        </div>
      </header>

      <main className="theme-body theme-body--stacked">
        {/* Every widget now renders inside one combined "grid-root" slot (see
           portfolioRenderer.tsx) — its own internal grid spacing replaces the per-widget
           padding this loop used to add individually, so there's nothing left to special-case
           per slot (the skills marquee's full-bleed CSS trick still works nested inside it). */}
        {slots.map((slot) => (
          <section key={slot.key} className="theme-slot theme-slot--animated">
            <RevealSlot>{slot.node}</RevealSlot>
          </section>
        ))}
      </main>

      <footer className="theme-footer theme-footer--animated">
        <div className="theme-footer-inner">
          <span>{profile.name || "Portfolio"} · Built with care.</span>
          <a href="#animated-top" className="theme-footer-top">
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
