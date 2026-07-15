"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import { resolveGridLayout, type Experience } from "@portfolio/schema";
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

/** The reference's "Journey" timeline shows year + a title that already reads as a complete
 *  sentence ("Enrolled at Parsons School of Design") + a detail paragraph — no separate
 *  organization line. Mapped onto the shared Experience schema as `dates` -> year,
 *  `role` -> title, `description` -> detail; `org` stays in the data (schema-required) but isn't
 *  rendered here, same "use the fields that map, ignore the rest" approach as other widgets
 *  reusing this section for a differently-shaped design.
 *
 *  Size variants (manifest sizes ["2x3","2x2","2x1"]; native = 2x3, the reference's alternating
 *  center-line timeline; always full-width). The @container 640px rules in the CSS are the
 *  correct portfolio-narrowness fallback and stay; the h-variants layer on top via the JS lookup:
 *  - h ≥ 3 (native): full alternating layout
 *  - h = 2: `--tight` — same layout, compressed vertical rhythm
 *  - h = 1: `--compact` — single-column list, no center-line alternation, first 4 entries on the
 *    public page (all while editing) */
export function CoutureEditorialExperienceTimelineComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Career Path";
  const heading = typeof config.heading === "string" ? config.heading : "The\nJourney";

  const grid = resolveGridLayout(data.widgets.filter((w) => w.visible), data.navGroups ?? []).find(
    (g) => g.key === instanceKey
  );
  const h = grid?.h ?? 3;
  const tight = h === 2;
  const compact = h === 1;
  const experience = compact && !editing ? data.experience.slice(0, 4) : data.experience;

  function updateEntry(index: number, patch: Partial<Experience>) {
    updateDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }
  function removeEntry(index: number) {
    updateDraft((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  }
  function addEntry() {
    updateDraft((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { role: "What happened", org: "", dates: new Date().getFullYear().toString(), description: "", source: "manual" as const, tags: [] },
      ],
    }));
  }

  return (
    <div
      className={`widget widget-couture-timeline${tight ? " widget-couture-timeline--tight" : ""}${compact ? " widget-couture-timeline--compact" : ""}`}
    >
      <div className="widget-couture-timeline-head">
        <span className="widget-eyebrow">{eyebrow}</span>
        <h2 className="widget-heading widget-heading--couture">{renderHeading(heading)}</h2>
      </div>

      {experience.length > 0 || editing ? (
        <ol className="widget-couture-timeline-list">
          {experience.map((entry, i) => (
            <li key={i} className={`widget-couture-timeline-entry${i % 2 === 1 ? " widget-couture-timeline-entry--right" : ""}`}>
              <span className="widget-couture-timeline-dot" aria-hidden="true" />
              <div className="widget-couture-timeline-card">
                <EditableText
                  as="span"
                  className="widget-couture-timeline-year"
                  value={entry.dates}
                  placeholder="Year"
                  onCommit={(next) => updateEntry(i, { dates: next })}
                />
                <EditableText
                  as="h3"
                  className="widget-couture-timeline-title"
                  value={entry.role}
                  placeholder="What happened"
                  onCommit={(next) => updateEntry(i, { role: next })}
                />
                {(editing || entry.description) && (
                  <EditableText
                    as="p"
                    className="widget-couture-timeline-detail"
                    value={entry.description}
                    placeholder="Add a detail"
                    multiline
                    onCommit={(next) => updateEntry(i, { description: next })}
                  />
                )}
                {editing && (
                  <button type="button" className="widget-couture-remove widget-couture-remove--static" onClick={() => removeEntry(i)}>
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="widget-empty">Add milestones to tell your career story.</p>
      )}
      {editing && (
        <button type="button" className="widget-couture-add widget-couture-add--block" onClick={addEntry}>
          + Add milestone
        </button>
      )}
    </div>
  );
}
