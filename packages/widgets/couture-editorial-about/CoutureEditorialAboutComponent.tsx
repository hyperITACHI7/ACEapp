"use client";

import { EditableText, useEditorMode, useToast } from "@portfolio/ui-kit";
import { resolveGridLayout } from "@portfolio/schema";
import type { WidgetProps } from "../types";

interface InfoItem {
  label: string;
  value: string;
}
interface ProcessStep {
  title: string;
  description: string;
  image: string;
}

function isInfoItem(v: unknown): v is InfoItem {
  return typeof v === "object" && v !== null && "label" in v && "value" in v;
}
function isProcessStep(v: unknown): v is ProcessStep {
  return typeof v === "object" && v !== null && "title" in v && "description" in v;
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

/**
 * Folds two reference sections into one widget: the portrait+bio+info-grid "About" block, and
 * the 3-step "Atelier & Craft" process — both are "about the maker's practice" content with no
 * existing section id worth splitting a whole new section for (see extract-portfolio skill
 * Phase 2's "fewer, richer widgets" rule). `infoItems` and `processSteps` are both config arrays
 * (no schema home), same convention as about-animated's `stats`.
 *
 * Size variants (manifest sizes ["2x4","2x2","2x1"]; native = 2x4, the reference design):
 * - h ≥ 3: portrait + bio + info grid + the full 3-step process block
 * - h = 2: process block hidden (portrait + bio + info grid)
 * - h = 1: compact — portrait + bio only (info grid also hidden)
 * Intermediate heights render the nearest variant at or below them (h=3 → same as h≥3 since
 * rows are auto-height; the thresholds are about how much CONTENT shows, not pixel heights).
 */
export function CoutureEditorialAboutComponent({ data, config, instanceKey }: WidgetProps) {
  const { editing, updateDraft, updateWidgetConfig, uploadImage } = useEditorMode();
  const { showToast } = useToast();

  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "About the Designer";
  const heading = typeof config.heading === "string" ? config.heading : "Crafting Identity\nThrough Cloth";
  const badge = typeof config.badge === "string" ? config.badge : "MA / CSM London";
  const ctaLabel = typeof config.ctaLabel === "string" ? config.ctaLabel : "Download Portfolio PDF";
  const infoItems: InfoItem[] = Array.isArray(config.infoItems) ? config.infoItems.filter(isInfoItem) : [];
  const processSteps: ProcessStep[] = Array.isArray(config.processSteps)
    ? config.processSteps.filter(isProcessStep)
    : [];
  const { photoUrl, bio, name } = data.profile;

  const grid = resolveGridLayout(data.widgets.filter((w) => w.visible), data.navGroups ?? []).find(
    (g) => g.key === instanceKey
  );
  const h = grid?.h ?? 4;
  const showProcess = h >= 3;
  const showInfo = h >= 2;

  function setInfoItems(next: InfoItem[]) {
    updateWidgetConfig(instanceKey, { infoItems: next });
  }
  function updateInfoItem(i: number, patch: Partial<InfoItem>) {
    setInfoItems(infoItems.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function removeInfoItem(i: number) {
    setInfoItems(infoItems.filter((_, idx) => idx !== i));
  }
  function addInfoItem() {
    setInfoItems([...infoItems, { label: "Label", value: "Value" }]);
  }

  function setProcessSteps(next: ProcessStep[]) {
    updateWidgetConfig(instanceKey, { processSteps: next });
  }
  function updateProcessStep(i: number, patch: Partial<ProcessStep>) {
    setProcessSteps(processSteps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeProcessStep(i: number) {
    setProcessSteps(processSteps.filter((_, idx) => idx !== i));
  }
  function addProcessStep() {
    setProcessSteps([...processSteps, { title: "Step title", description: "Describe this part of your process.", image: "" }]);
  }

  async function handleUploadPhoto(file: File) {
    try {
      const url = await uploadImage(file);
      updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, photoUrl: url } }));
    } catch {
      showToast("Couldn't upload that image. Please retry.", "error");
    }
  }

  async function handleUploadProcessImage(i: number, file: File) {
    try {
      const url = await uploadImage(file);
      updateProcessStep(i, { image: url });
    } catch {
      showToast("Couldn't upload that image. Please retry.", "error");
    }
  }

  return (
    <div className="widget widget-couture-about">
      <div className="widget-couture-about-grid">
        <div className="widget-couture-about-portrait-wrap">
          {photoUrl ? (
            <img src={photoUrl} alt={name || "Portrait"} className="widget-couture-about-portrait" />
          ) : (
            <div className="widget-couture-about-portrait widget-couture-about-portrait--placeholder" aria-hidden="true" />
          )}
          {editing && (
            <label className="widget-couture-photo-btn">
              Change photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="widget-couture-photo-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadPhoto(file);
                }}
              />
            </label>
          )}
          <span className="widget-couture-about-badge">{badge}</span>
        </div>

        <div className="widget-couture-about-text">
          <span className="widget-eyebrow">{eyebrow}</span>
          <h2 className="widget-heading widget-heading--couture">{renderHeading(heading)}</h2>

          {editing || bio ? (
            <EditableText
              as="p"
              className="widget-couture-about-bio"
              value={bio}
              placeholder="Add a bio to tell visitors about your practice."
              multiline
              onCommit={(next) => updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, bio: next } }))}
            />
          ) : (
            <p className="widget-empty">Add a bio to tell visitors about your practice.</p>
          )}

          {showInfo && (editing || infoItems.length > 0) && (
            <div className="widget-couture-about-info-grid">
              {infoItems.map((item, i) => (
                <div key={i} className="widget-couture-about-info-item">
                  <EditableText
                    as="span"
                    className="widget-couture-about-info-label"
                    value={item.label}
                    placeholder="Label"
                    onCommit={(next) => updateInfoItem(i, { label: next })}
                  />
                  <EditableText
                    as="span"
                    className="widget-couture-about-info-value"
                    value={item.value}
                    placeholder="Value"
                    onCommit={(next) => updateInfoItem(i, { value: next })}
                  />
                  {editing && (
                    <button type="button" className="widget-couture-remove" onClick={() => removeInfoItem(i)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              {editing && (
                <button type="button" className="widget-couture-add" onClick={addInfoItem}>
                  + Add detail
                </button>
              )}
            </div>
          )}

          <a href="#portfolio-section-contact" className="widget-couture-about-cta">
            {ctaLabel}
          </a>
        </div>
      </div>

      {showProcess && (editing || processSteps.length > 0) && (
        <div className="widget-couture-about-process">
          {processSteps.map((step, i) => (
            <div key={i} className="widget-couture-about-process-step">
              <div className="widget-couture-about-process-image-wrap">
                {step.image ? (
                  <img src={step.image} alt={step.title || "Process step"} className="widget-couture-about-process-image" />
                ) : (
                  <div className="widget-couture-about-process-image widget-couture-about-process-image--placeholder" aria-hidden="true" />
                )}
                {editing && (
                  <label className="widget-couture-photo-btn widget-couture-photo-btn--small">
                    Change
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="widget-couture-photo-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadProcessImage(i, file);
                      }}
                    />
                  </label>
                )}
              </div>
              <span className="widget-couture-about-process-index">{String(i + 1).padStart(2, "0")}</span>
              <EditableText
                as="h3"
                className="widget-couture-about-process-title"
                value={step.title}
                placeholder="Step title"
                onCommit={(next) => updateProcessStep(i, { title: next })}
              />
              <EditableText
                as="p"
                className="widget-couture-about-process-desc"
                value={step.description}
                placeholder="Describe this part of your process."
                multiline
                onCommit={(next) => updateProcessStep(i, { description: next })}
              />
              {editing && (
                <button type="button" className="widget-couture-remove widget-couture-remove--static" onClick={() => removeProcessStep(i)}>
                  Remove step
                </button>
              )}
            </div>
          ))}
          {editing && (
            <button type="button" className="widget-couture-add widget-couture-add--block" onClick={addProcessStep}>
              + Add process step
            </button>
          )}
        </div>
      )}
    </div>
  );
}
