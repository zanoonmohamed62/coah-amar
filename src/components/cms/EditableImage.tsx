"use client";

import { useEffect, useRef, useState } from "react";
import { useCmsEditMode } from "./CmsEditModeProvider";

type Props = {
  sectionId: string;
  fieldId: string;
  value: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Drop-in replacement for an <img src={get(...)}> that reads a CMS image field.
 * Outside CMS edit mode this is a plain <img> — zero behavior change for visitors.
 * In edit mode, hovering shows a "Change image" overlay; picking a file uploads it
 * through the existing public-safe /api/admin/cms/upload route (unauthenticated
 * `public/uploads/` storage — never the protected media library) and commits the
 * new URL the same way a text edit commits.
 */
export function EditableImage({ sectionId, fieldId, value, alt, className, style }: Props) {
  const { active, registerField, commitEdit } = useCmsEditMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [src, setSrc] = useState(value);

  useEffect(() => setSrc(value), [value]);

  useEffect(() => {
    if (active) registerField(sectionId, fieldId, value);
  }, [active, sectionId, fieldId, value, registerField]);

  if (!active) {
    return <img src={src} alt={alt} className={className} style={style} />;
  }

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/cms/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setSrc(data.url);
        commitEdit(sectionId, fieldId, data.url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      style={{ position: "relative", display: "contents" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          ...style,
          outline: hover ? "2px solid rgba(59,130,246,0.85)" : "1px dashed transparent",
          outlineOffset: -2,
          transition: "outline-color .12s",
        }}
        data-cms-section={sectionId}
        data-cms-field={fieldId}
      />
      {hover && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: "fit-content",
            height: "fit-content",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "rgba(15,17,23,0.92)",
            color: "#fff",
            border: "1px solid rgba(59,130,246,0.6)",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: uploading ? "default" : "pointer",
            zIndex: 20,
          }}
        >
          {uploading ? "Uploading…" : "Change Image"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
