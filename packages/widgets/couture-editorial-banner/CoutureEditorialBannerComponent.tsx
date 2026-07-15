"use client";

import { useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

function renderHeading(heading: string) {
  const lines = heading.split("\n");
  if (lines.length < 2) return heading;
  return (
    <>
      {lines[0]}
      <br />
      <span className="widget-heading-line--accent">{lines.slice(1).join(" ")}</span>
    </>
  );
}

/** A generic full-bleed feature/announcement banner ("Latest Show" in the reference) — a
 *  reusable pattern, not fashion-specific, which is why it got its own new `banner` section
 *  rather than being folded into `hero` (it sits mid-page, not at the top, so reusing hero's
 *  grid slot/position would misrepresent the blueprint's layout). */
export function CoutureEditorialBannerComponent({ config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig, uploadImage } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Latest Show";
  const heading = typeof config.heading === "string" ? config.heading : "London Fashion Week\nGraduate Showcase";
  const copy = typeof config.copy === "string" ? config.copy : "";
  const ctaLabel = typeof config.ctaLabel === "string" ? config.ctaLabel : "See Full Collection";
  const backgroundImage = typeof config.backgroundImage === "string" ? config.backgroundImage : "";

  async function handleUploadBackground(file: File) {
    const url = await uploadImage(file).catch(() => null);
    if (url) updateWidgetConfig(instanceKey, { backgroundImage: url });
  }

  return (
    <div className="widget widget-couture-banner" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}>
      <div className="widget-couture-banner-scrim" aria-hidden="true" />
      {editing && (
        <label className="widget-couture-photo-btn widget-couture-banner-bg-btn">
          Change background
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="widget-couture-photo-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadBackground(file);
            }}
          />
        </label>
      )}
      <div className="widget-couture-banner-content">
        <span className="widget-couture-banner-eyebrow">{eyebrow}</span>
        <h2 className="widget-couture-banner-heading">{renderHeading(heading)}</h2>
        {copy && <p className="widget-couture-banner-copy">{copy}</p>}
        <a href="#portfolio-section-gallery" className="widget-couture-banner-cta">
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
