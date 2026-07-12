"use client";

import type { WidgetProps } from "../types";
import { EditableText, useEditorMode } from "@portfolio/ui-kit";

export function AboutComponent({ data, config }: WidgetProps) {
  const { editing, updateDraft } = useEditorMode();
  const heading = typeof config.heading === "string" ? config.heading : "About";
  const bio = data.profile.bio?.trim();

  return (
    <div className="widget widget-about">
      <h2 className="widget-heading">{heading}</h2>
      {editing || bio ? (
        <EditableText
          as="p"
          className="widget-text"
          value={data.profile.bio}
          placeholder="Add a bio to tell visitors about yourself."
          multiline
          onCommit={(next) => updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, bio: next } }))}
        />
      ) : (
        <p className="widget-empty">Add a bio to tell visitors about yourself.</p>
      )}
    </div>
  );
}
