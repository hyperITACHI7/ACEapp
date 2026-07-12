"use client";

import { Github, Linkedin, Twitter, Mail, Globe, MapPin, type LucideIcon } from "lucide-react";
import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  email: Mail,
  mail: Mail,
};

function iconFor(platform: string): LucideIcon {
  return PLATFORM_ICONS[platform.trim().toLowerCase()] ?? Globe;
}

export function ContactCardsComponent({ data, config }: WidgetProps) {
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
    <div className="widget widget-contact-cards">
      <h2 className="widget-heading">{heading}</h2>
      {editing || hasContent ? (
        <div className="widget-contact-cards-body">
          {(editing || location) && (
            <div className="widget-contact-cards-location">
              <MapPin size={14} />
              <EditableText as="span" value={location} placeholder="City, Country" onCommit={updateLocation} />
            </div>
          )}
          <div className="widget-contact-cards-list">
            {socialLinks.map((link, i) => {
              const Icon = iconFor(link.platform);
              return (
                <div key={i} className="widget-contact-cards-row">
                  <span className="widget-contact-cards-icon">
                    <Icon size={14} />
                  </span>
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
                    <a href={link.url} target="_blank" rel="noreferrer" className="widget-contact-cards-link">
                      {link.platform}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
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
