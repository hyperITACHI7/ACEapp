"use client";

import * as React from "react";
import { useEditorMode } from "./EditorModeContext";
import { cn } from "./utils";

export interface EditableTextProps {
  as?: React.ElementType;
  className?: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  onCommit: (next: string) => void;
}

/**
 * Renders plain text in read-only mode (public page). In editor mode, renders an
 * uncontrolled contentEditable element: typing mutates the DOM directly and React
 * never re-renders this component mid-edit (the `value` prop only changes after
 * `onCommit` fires), which avoids the classic contentEditable/React cursor-jump fight.
 */
export function EditableText({
  as: Tag = "span",
  className,
  value,
  placeholder,
  multiline = false,
  onCommit,
}: EditableTextProps) {
  const { editing } = useEditorMode();

  if (!editing) {
    return <Tag className={className}>{value || placeholder}</Tag>;
  }

  return (
    <Tag
      className={cn("is-editable", className)}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = e.currentTarget.textContent ?? "";
        if (next !== value) onCommit(next);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >
      {value}
    </Tag>
  );
}
