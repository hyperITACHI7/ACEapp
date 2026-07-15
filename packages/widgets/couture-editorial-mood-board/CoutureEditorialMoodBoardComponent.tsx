"use client";

import { EditableText, useEditorMode, useToast } from "@portfolio/ui-kit";
import { resolveGridLayout } from "@portfolio/schema";
import type { WidgetProps } from "../types";

interface MoodImage {
  url: string;
  alt: string;
  wide?: boolean;
  tall?: boolean;
}
function isMoodImage(v: unknown): v is MoodImage {
  return typeof v === "object" && v !== null && "url" in v;
}

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

/** Purely config-driven (no schema home — this is atmospheric/research imagery, not the user's
 *  actual project work, so it doesn't belong in `data.projects`). `wide`/`tall` are simple
 *  boolean toggles standing in for the reference's per-image colSpan/rowSpan values — kept as
 *  two independent flags rather than numeric spans since the 2-column grid only ever needs
 *  "double width" and/or "double height" as options.
 *
 *  Size variants (manifest sizes ["2x2","2x1"]; native = 2x2, the reference's masonry collage):
 *  - h ≥ 2: full collage honoring each image's wide/tall spans
 *  - h = 1: strip — one uniform row of squares (spans ignored via CSS `--strip`), themes list
 *    still shown below
 */
export function CoutureEditorialMoodBoardComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig, uploadImage } = useEditorMode();
  const { showToast } = useToast();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Visual Research";
  const heading = typeof config.heading === "string" ? config.heading : "Mood\nBoard";
  const images: MoodImage[] = Array.isArray(config.images) ? config.images.filter(isMoodImage) : [];
  const themes: string[] = Array.isArray(config.themes) ? config.themes.filter((t) => typeof t === "string") : [];

  const grid = resolveGridLayout(data.widgets.filter((w) => w.visible), data.navGroups ?? []).find(
    (g) => g.key === instanceKey
  );
  const strip = (grid?.h ?? 2) === 1;

  function setImages(next: MoodImage[]) {
    updateWidgetConfig(instanceKey, { images: next });
  }
  function removeImage(i: number) {
    setImages(images.filter((_, idx) => idx !== i));
  }
  function addImage() {
    setImages([...images, { url: "", alt: "" }]);
  }
  async function handleUploadImage(i: number, file: File) {
    try {
      const url = await uploadImage(file);
      setImages(images.map((img, idx) => (idx === i ? { ...img, url } : img)));
    } catch {
      showToast("Couldn't upload that image. Please retry.", "error");
    }
  }

  function setThemes(next: string[]) {
    updateWidgetConfig(instanceKey, { themes: next });
  }
  function updateTheme(i: number, next: string) {
    const trimmed = next.trim();
    const nextThemes = [...themes];
    if (!trimmed) nextThemes.splice(i, 1);
    else nextThemes[i] = trimmed;
    setThemes(nextThemes);
  }
  function addTheme() {
    setThemes([...themes, "New theme"]);
  }

  return (
    <div className={`widget widget-couture-mood-board${strip ? " widget-couture-mood-board--strip" : ""}`}>
      <span className="widget-eyebrow">{eyebrow}</span>
      <h2 className="widget-heading widget-heading--couture">{renderHeading(heading)}</h2>

      {images.length > 0 || editing ? (
        <div className="widget-couture-mood-grid">
          {images.map((img, i) => (
            <div
              key={i}
              className={`widget-couture-mood-cell${img.wide ? " widget-couture-mood-cell--wide" : ""}${img.tall ? " widget-couture-mood-cell--tall" : ""}`}
            >
              {img.url ? (
                <img src={img.url} alt={img.alt || "Mood board image"} className="widget-couture-mood-image" />
              ) : (
                <div className="widget-couture-mood-image widget-couture-mood-image--placeholder" aria-hidden="true" />
              )}
              {editing && (
                <>
                  <label className="widget-couture-photo-btn widget-couture-photo-btn--small">
                    Change
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="widget-couture-photo-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(i, file);
                      }}
                    />
                  </label>
                  <button type="button" className="widget-couture-remove widget-couture-mood-remove" onClick={() => removeImage(i)}>
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
          {editing && (
            <button type="button" className="widget-couture-add widget-couture-mood-add" onClick={addImage}>
              + Add image
            </button>
          )}
        </div>
      ) : (
        <p className="widget-empty">Add reference images to set the visual tone of your work.</p>
      )}

      {(editing || themes.length > 0) && (
        <ul className="widget-couture-mood-themes">
          {themes.map((theme, i) => (
            <li key={i} className="widget-couture-mood-theme">
              <span className="widget-couture-mood-dot" aria-hidden="true" />
              <EditableText as="span" value={theme} placeholder="Theme" onCommit={(next) => updateTheme(i, next)} />
            </li>
          ))}
          {editing && (
            <li>
              <button type="button" className="widget-couture-add" onClick={addTheme}>
                + Add theme
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
