"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

interface StatItem {
  value: string;
  label: string;
}
function isStatItem(v: unknown): v is StatItem {
  return typeof v === "object" && v !== null && "value" in v && "label" in v;
}

/**
 * The reference's name + tagline + CTA + stats block. `profile.name` is the big display name;
 * `profile.headline` (a short line under the name in the shared schema) doubles as this widget's
 * italic editorial tagline — no separate schema field exists for that voice, and headline's
 * purpose ("short line under the name") matches closely enough that adding a config-only
 * duplicate would just fork the same idea in two places. Stats are a config array (no schema
 * home), same convention as about-animated's `stats`.
 */
export function CoutureEditorialHeroComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateDraft, updateWidgetConfig, uploadImage } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Portfolio — Lifetime Digital Archive";
  const primaryCtaLabel = typeof config.primaryCtaLabel === "string" ? config.primaryCtaLabel : "View Collections";
  const secondaryCtaLabel = typeof config.secondaryCtaLabel === "string" ? config.secondaryCtaLabel : "My Journey";
  const backgroundImage = typeof config.backgroundImage === "string" ? config.backgroundImage : "";
  const stats: StatItem[] = Array.isArray(config.stats) ? config.stats.filter(isStatItem) : [];
  const { name, headline } = data.profile;

  function setStats(next: StatItem[]) {
    updateWidgetConfig(instanceKey, { stats: next });
  }
  function updateStat(i: number, patch: Partial<StatItem>) {
    setStats(stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeStat(i: number) {
    setStats(stats.filter((_, idx) => idx !== i));
  }
  function addStat() {
    setStats([...stats, { value: "00", label: "New stat" }]);
  }

  async function handleUploadBackground(file: File) {
    const url = await uploadImage(file).catch(() => null);
    if (url) updateWidgetConfig(instanceKey, { backgroundImage: url });
  }

  return (
    <div className="widget widget-couture-hero" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}>
      <div className="widget-couture-hero-scrim" aria-hidden="true" />
      {editing && (
        <label className="widget-couture-photo-btn widget-couture-hero-bg-btn">
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
      <div className="widget-couture-hero-content">
        <span className="widget-couture-hero-eyebrow">{eyebrow}</span>
        <EditableText
          as="h1"
          className="widget-couture-hero-name"
          value={name}
          placeholder="Your Name"
          onCommit={(next) => updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, name: next } }))}
        />
        <EditableText
          as="p"
          className="widget-couture-hero-tagline"
          value={headline}
          placeholder="A one-line statement about your work."
          onCommit={(next) => updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, headline: next } }))}
        />
        <div className="widget-couture-hero-ctas">
          <a href="#portfolio-section-gallery" className="widget-couture-hero-cta-primary">
            {primaryCtaLabel}
          </a>
          <a href="#portfolio-section-experience-timeline" className="widget-couture-hero-cta-secondary">
            {secondaryCtaLabel}
          </a>
        </div>

        {(editing || stats.length > 0) && (
          <div className="widget-couture-hero-stats">
            {stats.map((stat, i) => (
              <div key={i} className="widget-couture-hero-stat">
                <EditableText
                  as="span"
                  className="widget-couture-hero-stat-value"
                  value={stat.value}
                  placeholder="00"
                  onCommit={(next) => updateStat(i, { value: next })}
                />
                <EditableText
                  as="span"
                  className="widget-couture-hero-stat-label"
                  value={stat.label}
                  placeholder="Label"
                  onCommit={(next) => updateStat(i, { label: next })}
                />
                {editing && (
                  <button type="button" className="widget-couture-remove" onClick={() => removeStat(i)}>
                    ×
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button type="button" className="widget-couture-add" onClick={addStat}>
                + Add stat
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
