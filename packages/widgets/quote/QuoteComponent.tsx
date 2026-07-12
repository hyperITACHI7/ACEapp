"use client";

import { EditableText, useEditorMode } from "@portfolio/ui-kit";
import type { WidgetProps } from "../types";

export function QuoteComponent({ config, instanceKey }: WidgetProps) {
  const { editing, updateWidgetConfig } = useEditorMode();
  const heading = typeof config.heading === "string" ? config.heading : "Quote";
  const text = typeof config.text === "string" ? config.text : "";
  const author = typeof config.author === "string" ? config.author : "";

  const hasContent = text.trim().length > 0;

  return (
    <div className="widget widget-quote">
      <h2 className="widget-heading">{heading}</h2>
      {editing || hasContent ? (
        <blockquote className="widget-quote-block">
          <EditableText
            as="p"
            className="widget-quote-text"
            value={text}
            placeholder="The best code is no code at all."
            multiline
            onCommit={(next) => updateWidgetConfig(instanceKey, { text: next })}
          />
          <EditableText
            as="footer"
            className="widget-quote-author"
            value={author}
            placeholder="Author"
            onCommit={(next) => updateWidgetConfig(instanceKey, { author: next })}
          />
        </blockquote>
      ) : (
        <p className="widget-empty">Add a quote that captures your outlook.</p>
      )}
    </div>
  );
}
