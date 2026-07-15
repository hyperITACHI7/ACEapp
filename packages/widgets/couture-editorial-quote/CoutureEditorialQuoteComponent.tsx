"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import { resolveGridLayout } from "@portfolio/schema";
import type { WidgetProps } from "../types";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}
function isTestimonial(v: unknown): v is Testimonial {
  return typeof v === "object" && v !== null && "quote" in v && "name" in v;
}

function initialsFor(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return initials || "?";
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

/** Multiple testimonials (config array), a different shape from the sibling `quote` widget's
 *  single text/author pair — a legitimate "alternate style" within the same section (see the
 *  extract-portfolio skill's Phase 2 rule that a shared section id means alternate styles for
 *  the same *kind* of content, not an identical data shape). Deliberately no avatar photo field
 *  — reference used stock headshots attached to fabricated names, so this ships with initials
 *  avatars only (same `initialsFor` pattern as animated-motion's theme header).
 *
 *  Size variants (manifest sizes ["2x1","1x1"]; native = 2x1, the reference's three-card row):
 *  - 2x1 (native): all testimonials in the auto-fit card grid
 *  - 1x1: first testimonial only on the public page (all stay reachable while editing) */
export function CoutureEditorialQuoteComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Voices";
  const heading = typeof config.heading === "string" ? config.heading : "What They\nSay";
  const allTestimonials: Testimonial[] = Array.isArray(config.testimonials) ? config.testimonials.filter(isTestimonial) : [];

  const grid = resolveGridLayout(data.widgets.filter((w) => w.visible), data.navGroups ?? []).find(
    (g) => g.key === instanceKey
  );
  const single = (grid?.w ?? 2) === 1;
  const testimonials = single && !editing ? allTestimonials.slice(0, 1) : allTestimonials;

  function setTestimonials(next: Testimonial[]) {
    updateWidgetConfig(instanceKey, { testimonials: next });
  }
  function updateTestimonial(i: number, patch: Partial<Testimonial>) {
    setTestimonials(allTestimonials.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function removeTestimonial(i: number) {
    setTestimonials(allTestimonials.filter((_, idx) => idx !== i));
  }
  function addTestimonial() {
    setTestimonials([...allTestimonials, { quote: "Add a testimonial.", name: "Name", role: "Role, Organization" }]);
  }

  return (
    <div className="widget widget-couture-quote">
      <span className="widget-eyebrow">{eyebrow}</span>
      <h2 className="widget-heading widget-heading--couture">{renderHeading(heading)}</h2>

      {testimonials.length > 0 || editing ? (
        <div className="widget-couture-quote-grid">
          {testimonials.map((t, i) => (
            <figure key={i} className="widget-couture-quote-card">
              <span className="widget-couture-quote-mark" aria-hidden="true">
                "
              </span>
              <EditableText
                as="blockquote"
                className="widget-couture-quote-text"
                value={t.quote}
                placeholder="Add a testimonial."
                multiline
                onCommit={(next) => updateTestimonial(i, { quote: next })}
              />
              <figcaption className="widget-couture-quote-attribution">
                <span className="widget-couture-quote-avatar" aria-hidden="true">
                  {initialsFor(t.name)}
                </span>
                <span>
                  <EditableText
                    as="span"
                    className="widget-couture-quote-name"
                    value={t.name}
                    placeholder="Name"
                    onCommit={(next) => updateTestimonial(i, { name: next })}
                  />
                  <EditableText
                    as="span"
                    className="widget-couture-quote-role"
                    value={t.role}
                    placeholder="Role, Organization"
                    onCommit={(next) => updateTestimonial(i, { role: next })}
                  />
                </span>
              </figcaption>
              {editing && (
                <button type="button" className="widget-couture-remove widget-couture-remove--static" onClick={() => removeTestimonial(i)}>
                  Remove
                </button>
              )}
            </figure>
          ))}
          {editing && (
            <button type="button" className="widget-couture-add widget-couture-quote-add" onClick={addTestimonial}>
              + Add testimonial
            </button>
          )}
        </div>
      ) : (
        <p className="widget-empty">Add a testimonial to build trust with visitors.</p>
      )}
    </div>
  );
}
