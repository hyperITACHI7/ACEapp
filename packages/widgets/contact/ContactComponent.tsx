"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

export function ContactComponent({ data, config }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const heading = typeof config.heading === "string" ? config.heading : "Contact";
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
      profile: { ...prev.profile, socialLinks: [...prev.profile.socialLinks, { platform: "Email", url: "mailto:" }] },
    }));
  }

  const hasContent = location.trim().length > 0 || socialLinks.length > 0;

  return (
    <div className="widget widget-contact">
      <h2 className="widget-heading">{heading}</h2>
      {editing || hasContent ? (
        <div className="widget-contact-body">
          {(editing || location) && (
            <EditableText
              as="div"
              className="widget-contact-location"
              value={location}
              placeholder="City, Country"
              onCommit={updateLocation}
            />
          )}
          <ul className="widget-contact-list">
            {socialLinks.map((link, i) => (
              <li key={i} className="widget-contact-row">
                {editing ? (
                  <>
                    <EditableText
                      as="span"
                      className="widget-contact-platform"
                      value={link.platform}
                      placeholder="Platform"
                      onCommit={(next) => updateLink(i, { platform: next })}
                    />
                    <EditableText
                      as="span"
                      className="widget-contact-url"
                      value={link.url}
                      placeholder="https://"
                      onCommit={(next) => updateLink(i, { url: next })}
                    />
                    <button
                      type="button"
                      className="widget-contact-remove"
                      aria-label={`Remove ${link.platform}`}
                      onClick={() => removeLink(i)}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <a href={link.url} target="_blank" rel="noreferrer" className="widget-contact-link">
                    <span className="widget-contact-platform">{link.platform}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
          {editing && (
            <button type="button" className="widget-contact-add" onClick={addLink}>
              + Add link
            </button>
          )}
        </div>
      ) : (
        <p className="widget-empty">Add your location and links so visitors can reach you.</p>
      )}
    </div>
  );
}
