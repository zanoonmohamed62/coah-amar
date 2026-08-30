"use client";

import { useRef, useEffect, ElementType } from "react";
import { useCmsEditMode } from "./CmsEditModeProvider";

type Props = {
  sectionId: string;
  fieldId: string;
  value: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
};

/**
 * Drop-in replacement for rendering `get(sectionId, fieldId, fallback)` as plain text.
 * Outside the admin CMS iframe this renders identically to a plain element — zero
 * behavior change for real site visitors. Inside CMS edit mode, it becomes directly
 * editable in place (click to focus, type, blur to commit) instead of routing through
 * a separate form.
 */
export function EditableText({
  sectionId,
  fieldId,
  value,
  as: Tag = "span",
  className,
  multiline = false,
  style,
}: Props) {
  const { active, registerField, commitEdit } = useCmsEditMode();
  const ref = useRef<HTMLElement>(null);
  const lastCommitted = useRef(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active) registerField(sectionId, fieldId, value);
  }, [active, sectionId, fieldId, value, registerField]);

  // Clear any pending debounce timer on unmount so it can't fire after teardown.
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  if (!active) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        outline: value ? "1px dashed transparent" : "1px dashed rgba(59,130,246,0.5)",
        outlineOffset: 2,
        cursor: "text",
        transition: "outline-color .12s, background-color .12s",
        borderRadius: 2,
        whiteSpace: multiline ? "pre-wrap" : style?.whiteSpace,
        display: value ? style?.display : "inline-block",
        minWidth: value ? undefined : 90,
        minHeight: value ? undefined : "1.2em",
      }}
      data-cms-placeholder={value ? undefined : (multiline ? "Click to add text…" : "Click to add…")}
      data-cms-section={sectionId}
      data-cms-field={fieldId}
      contentEditable
      suppressContentEditableWarning
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        (e.currentTarget as HTMLElement).style.outlineColor = "rgba(59,130,246,0.7)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(59,130,246,0.06)";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        (e.currentTarget as HTMLElement).style.outlineColor = "transparent";
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
      }}
      onFocus={(e: React.FocusEvent<HTMLElement>) => {
        (e.currentTarget as HTMLElement).style.outline = "2px solid rgba(59,130,246,0.9)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(59,130,246,0.1)";
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
        if (e.key === "Escape") {
          (e.currentTarget as HTMLElement).textContent = lastCommitted.current;
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        // Commit while typing (debounced) so the parent's Save button reflects
        // unsaved changes almost immediately, instead of only after the field
        // loses focus — this is what makes Save reliably enable/save the very
        // latest text instead of racing a stale blur-only commit.
        const el = e.currentTarget as HTMLElement;
        const next = el.textContent ?? "";
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (next !== lastCommitted.current) {
            lastCommitted.current = next;
            commitEdit(sectionId, fieldId, next);
          }
        }, 250);
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const el = e.currentTarget as HTMLElement;
        el.style.outline = "1px dashed transparent";
        el.style.backgroundColor = "transparent";
        if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
        const next = el.textContent ?? "";
        if (next !== lastCommitted.current) {
          lastCommitted.current = next;
          commitEdit(sectionId, fieldId, next);
        }
      }}
    >
      {value}
    </Tag>
  );
}
