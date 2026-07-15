"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import { resolveGridLayout } from "@portfolio/schema";
import type { WidgetProps } from "../types";

interface ProgressBar {
  label: string;
  percent: number;
}
function isProgressBar(v: unknown): v is ProgressBar {
  return typeof v === "object" && v !== null && "label" in v && "percent" in v;
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

/** Two independent lists side by side: `data.skills` (plain tag pills, schema-backed, same
 *  editing pattern as the base `skills` widget) and `config.progressBars` (labeled percentage
 *  bars — `PortfolioData.skills` is just `string[]`, no percent field, so this half is a config
 *  array with no schema home, same convention as about-animated's `stats`).
 *
 *  Size variants (manifest sizes ["1x2","1x1","2x1"]; native = 1x2, the half-column stack beside
 *  Awards). Footprint from the JS lookup, not @container (which would match portfolio width, not
 *  this widget's own cell):
 *  - 1x2 (native): pills stacked above bars
 *  - 2x1: `--wide` — pills and bars side by side across the full row
 *  - 1x1: `--compact` — pills only, bars hidden (still shown while editing so they stay
 *    reachable) */
export function CoutureEditorialSkillsComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateDraft, updateWidgetConfig } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Expertise";
  const heading = typeof config.heading === "string" ? config.heading : "Skills &\nDisciplines";
  const visibleSkills = data.skills.filter(Boolean);
  const bars: ProgressBar[] = Array.isArray(config.progressBars) ? config.progressBars.filter(isProgressBar) : [];

  const grid = resolveGridLayout(data.widgets.filter((w) => w.visible), data.navGroups ?? []).find(
    (g) => g.key === instanceKey
  );
  const wide = (grid?.w ?? 1) === 2;
  const compact = !wide && (grid?.h ?? 2) === 1;

  function commitSkill(index: number, next: string) {
    const trimmed = next.trim();
    updateDraft((prev) => {
      const nextSkills = [...prev.skills];
      if (!trimmed) nextSkills.splice(index, 1);
      else nextSkills[index] = trimmed;
      return { ...prev, skills: nextSkills };
    });
  }
  function removeSkill(index: number) {
    updateDraft((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  }
  function addSkill() {
    updateDraft((prev) => ({ ...prev, skills: [...prev.skills, "New skill"] }));
  }

  function setBars(next: ProgressBar[]) {
    updateWidgetConfig(instanceKey, { progressBars: next });
  }
  function updateBar(i: number, patch: Partial<ProgressBar>) {
    setBars(bars.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }
  function removeBar(i: number) {
    setBars(bars.filter((_, idx) => idx !== i));
  }
  function addBar() {
    setBars([...bars, { label: "New skill", percent: 75 }]);
  }

  const showEmpty = !editing && visibleSkills.length === 0 && bars.length === 0;

  return (
    <div
      className={`widget widget-couture-skills${wide ? " widget-couture-skills--wide" : ""}${compact ? " widget-couture-skills--compact" : ""}`}
    >
      <span className="widget-eyebrow">{eyebrow}</span>
      <h2 className="widget-heading widget-heading--couture">{renderHeading(heading)}</h2>

      {showEmpty ? (
        <p className="widget-empty">Add a few skills to showcase your strengths.</p>
      ) : (
        <div className="widget-couture-skills-grid">
          <ul className="widget-skills-list widget-couture-skills-pills">
            {(editing ? data.skills : visibleSkills).map((skill, i) => (
              <li key={i} className="widget-skill-tag widget-couture-skill-tag">
                <EditableText as="span" value={skill} placeholder="Skill" onCommit={(next) => commitSkill(i, next)} />
                {editing && (
                  <button type="button" className="widget-skill-remove" aria-label={`Remove ${skill}`} onClick={() => removeSkill(i)}>
                    ×
                  </button>
                )}
              </li>
            ))}
            {editing && (
              <li className="widget-skill-tag widget-skill-tag--add">
                <button type="button" onClick={addSkill}>
                  + Add skill
                </button>
              </li>
            )}
          </ul>

          {(editing || (bars.length > 0 && !compact)) && (
            <div className="widget-couture-skills-bars">
              {bars.map((bar, i) => (
                <div key={i} className="widget-couture-skills-bar-row">
                  <div className="widget-couture-skills-bar-head">
                    <EditableText
                      as="span"
                      className="widget-couture-skills-bar-label"
                      value={bar.label}
                      placeholder="Skill"
                      onCommit={(next) => updateBar(i, { label: next })}
                    />
                    <span className="widget-couture-skills-bar-percent">{bar.percent}%</span>
                    {editing && (
                      <button type="button" className="widget-couture-remove" onClick={() => removeBar(i)}>
                        ×
                      </button>
                    )}
                  </div>
                  <div className="widget-couture-skills-bar-track">
                    <div className="widget-couture-skills-bar-fill" style={{ width: `${Math.min(100, Math.max(0, bar.percent))}%` }} />
                  </div>
                  {editing && (
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={bar.percent}
                      onChange={(e) => updateBar(i, { percent: Number(e.target.value) })}
                      className="widget-couture-skills-bar-slider"
                    />
                  )}
                </div>
              ))}
              {editing && (
                <button type="button" className="widget-couture-add widget-couture-add--block" onClick={addBar}>
                  + Add proficiency bar
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
