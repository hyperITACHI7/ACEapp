"use client";

import { Instagram, Linkedin, Mail, Globe, type LucideIcon } from "lucide-react";
import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  linkedin: Linkedin,
  email: Mail,
  mail: Mail,
};
function iconFor(platform: string): LucideIcon {
  return PLATFORM_ICONS[platform.trim().toLowerCase()] ?? Globe;
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

export function CoutureEditorialContactComponent({ data, config }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Get in Touch";
  const heading = typeof config.heading === "string" ? config.heading : "Collaborate.\nCommission. Connect.";
  const copy = typeof config.copy === "string" ? config.copy : "";
  const studio = typeof config.studio === "string" ? config.studio : "";
  const stockists = typeof config.stockists === "string" ? config.stockists : "";
  const { location, socialLinks } = data.profile;

  function updateLocation(next: string) {
    updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, location: next } }));
  }
  function updateLink(index: number, patch: Partial<{ platform: string; url: string }>) {
    updateDraft((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        socialLinks: prev.profile.socialLinks.map((link, i) => (i === index ? { ...link, ...patch } : link)),
      },
    }));
  }
  function removeLink(index: number) {
    updateDraft((prev) => ({
      ...prev,
      profile: { ...prev.profile, socialLinks: prev.profile.socialLinks.filter((_, i) => i !== index) },
    }));
  }
  function addLink() {
    updateDraft((prev) => ({
      ...prev,
      profile: { ...prev.profile, socialLinks: [...prev.profile.socialLinks, { platform: "Instagram", url: "https://instagram.com/" }] },
    }));
  }

  return (
    <div className="widget widget-couture-contact">
      <span className="widget-eyebrow">{eyebrow}</span>
      <h2 className="widget-heading widget-heading--couture">{renderHeading(heading)}</h2>
      {copy && <p className="widget-couture-contact-copy">{copy}</p>}

      <div className="widget-couture-contact-rows">
        {(editing || location) && (
          <div className="widget-couture-contact-row">
            <span className="widget-couture-contact-label">Location</span>
            <EditableText as="span" value={location} placeholder="City, Country" onCommit={updateLocation} />
          </div>
        )}
        {studio && (
          <div className="widget-couture-contact-row">
            <span className="widget-couture-contact-label">Studio</span>
            <span>{studio}</span>
          </div>
        )}
        {stockists && (
          <div className="widget-couture-contact-row">
            <span className="widget-couture-contact-label">Stockists</span>
            <span>{stockists}</span>
          </div>
        )}
      </div>

      {(editing || socialLinks.length > 0) && (
        <div className="widget-couture-contact-links">
          {socialLinks.map((link, i) => {
            const Icon = iconFor(link.platform);
            return editing ? (
              <div key={i} className="widget-couture-contact-link-row">
                <Icon size={14} />
                <EditableText
                  as="span"
                  value={link.platform}
                  placeholder="Platform"
                  onCommit={(next) => updateLink(i, { platform: next })}
                />
                <EditableText as="span" value={link.url} placeholder="https://" onCommit={(next) => updateLink(i, { url: next })} />
                <button type="button" className="widget-couture-remove" onClick={() => removeLink(i)} aria-label={`Remove ${link.platform}`}>
                  ×
                </button>
              </div>
            ) : (
              <a key={i} href={link.url} target="_blank" rel="noreferrer" className="widget-couture-contact-link">
                <Icon size={14} />
                {link.platform}
              </a>
            );
          })}
          {editing && (
            <button type="button" className="widget-couture-add" onClick={addLink}>
              + Add link
            </button>
          )}
        </div>
      )}
    </div>
  );
}
