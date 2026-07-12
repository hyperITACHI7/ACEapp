"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

interface StatItem {
  value: string;
  label: string;
}

function isStatItem(value: unknown): value is StatItem {
  return typeof value === "object" && value !== null && "value" in value && "label" in value;
}

/** A heading may embed a literal "\n" to render a second, accent-colored line — matches this
 *  theme's two-tone display headings without needing a separate config field. */
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

/** Self-contained stat grid (own `config.stats`) paired with the shared bio — this particular
 *  about+stats combo has no natural home in the shared schema, same pattern as Skills Bars. */
export function AboutAnimatedComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateDraft, updateWidgetConfig } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "About Me";
  const heading = typeof config.heading === "string" ? config.heading : "A closer look";
  const bio = data.profile.bio?.trim();
  const stats: StatItem[] = Array.isArray(config.stats) ? config.stats.filter(isStatItem) : [];
  const { photoUrl, location, name } = data.profile;

  function setStats(next: StatItem[]) {
    updateWidgetConfig(instanceKey, { stats: next });
  }

  function updateStat(index: number, patch: Partial<StatItem>) {
    setStats(stats.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeStat(index: number) {
    setStats(stats.filter((_, i) => i !== index));
  }

  function addStat() {
    setStats([...stats, { value: "00", label: "New stat" }]);
  }

  function updateLocation(next: string) {
    updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, location: next } }));
  }

  return (
    <div className="widget widget-about-animated">
      <div className="widget-about-animated-grid">
        <div>
          <span className="widget-eyebrow">{eyebrow}</span>
          <h2 className="widget-heading widget-heading--animated">{renderHeading(heading)}</h2>
          {editing || bio ? (
            <EditableText
              as="p"
              className="widget-about-animated-bio"
              value={data.profile.bio}
              placeholder="Add a bio to tell visitors about yourself."
              multiline
              onCommit={(next) => updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, bio: next } }))}
            />
          ) : (
            <p className="widget-empty">Add a bio to tell visitors about yourself.</p>
          )}
          {(editing || stats.length > 0) && (
            <div className="widget-about-animated-stats">
              {stats.map((stat, i) => (
                <div key={i} className="widget-about-animated-stat">
                  <EditableText
                    as="span"
                    className="widget-about-animated-stat-value"
                    value={stat.value}
                    placeholder="00"
                    onCommit={(next) => updateStat(i, { value: next })}
                  />
                  <EditableText
                    as="span"
                    className="widget-about-animated-stat-label"
                    value={stat.label}
                    placeholder="Label"
                    onCommit={(next) => updateStat(i, { label: next })}
                  />
                  {editing && (
                    <button type="button" className="widget-about-animated-stat-remove" onClick={() => removeStat(i)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              {editing && (
                <button type="button" className="widget-about-animated-stat-add" onClick={addStat}>
                  + Add stat
                </button>
              )}
            </div>
          )}
        </div>
        {(editing || photoUrl) && (
          <div className="widget-about-animated-portrait">
            {photoUrl ? (
              <img src={photoUrl} alt={name || "Profile photo"} className="widget-about-animated-photo" />
            ) : (
              <div className="widget-about-animated-photo widget-about-animated-photo--placeholder" aria-hidden="true" />
            )}
            <div className="widget-about-animated-strip" />
            {(editing || location) && (
              <EditableText
                as="div"
                className="widget-about-animated-badge"
                value={location}
                placeholder="Location"
                onCommit={updateLocation}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
