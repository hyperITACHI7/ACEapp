"use client";

import { Github, Linkedin, Twitter, Mail, Globe, type LucideIcon } from "lucide-react";
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

function emailLink(socialLinks: { platform: string; url: string }[]): string | null {
  const emailEntry = socialLinks.find((l) => /mail/i.test(l.platform));
  return emailEntry?.url ?? null;
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

export function ContactAnimatedComponent({ data, config }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const eyebrow = typeof config.eyebrow === "string" ? config.eyebrow : "Get In Touch";
  const heading = typeof config.heading === "string" ? config.heading : "Let's create\nsomething new";
  const lead =
    typeof config.lead === "string"
      ? config.lead
      : "Open to new projects and collaborations — I usually reply within a day or two.";
  const { socialLinks } = data.profile;
  const email = emailLink(socialLinks);

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

  return (
    <div className="widget widget-contact-animated">
      <div className="widget-contact-animated-glow" aria-hidden="true" />
      <span className="widget-eyebrow">{eyebrow}</span>
      <h2 className="widget-heading widget-heading--animated-cta">{renderHeading(heading)}</h2>
      <p className="widget-contact-animated-lead">{lead}</p>
      {(editing || email) && (
        <a href={email ?? "#"} className="widget-contact-animated-email">
          <Mail size={18} />
          {email ? email.replace(/^mailto:/, "") : "you@example.com"}
        </a>
      )}
      <div className="widget-contact-animated-socials">
        {socialLinks.map((link, i) => {
          const Icon = iconFor(link.platform);
          return editing ? (
            <div key={i} className="widget-contact-animated-social-edit">
              <span className="widget-contact-animated-icon">
                <Icon size={16} />
              </span>
              <EditableText
                as="span"
                value={link.platform}
                placeholder="Platform"
                onCommit={(next) => updateLink(i, { platform: next })}
              />
              <EditableText
                as="span"
                value={link.url}
                placeholder="https://"
                onCommit={(next) => updateLink(i, { url: next })}
              />
              <button type="button" className="widget-contact-remove" onClick={() => removeLink(i)}>
                ×
              </button>
            </div>
          ) : (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="widget-contact-animated-social"
              aria-label={link.platform}
            >
              <Icon size={18} />
            </a>
          );
        })}
        {editing && (
          <button type="button" className="widget-contact-add" onClick={addLink}>
            + Add link
          </button>
        )}
      </div>
      {!editing && !email && socialLinks.length === 0 && (
        <p className="widget-empty">Add an email and social links so visitors can reach you.</p>
      )}
    </div>
  );
}
