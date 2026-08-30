"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { clearSiteContentCache } from "@/lib/use-site-content";

type PendingEdit = { sectionId: string; fieldId: string; lang: "en" | "ar"; value: string };

type CmsEditModeContextType = {
  active: boolean;
  lang: "en" | "ar";
  registerField: (sectionId: string, fieldId: string, currentValue: string) => void;
  commitEdit: (sectionId: string, fieldId: string, value: string) => void;
};

const CmsEditModeContext = createContext<CmsEditModeContextType>({
  active: false,
  lang: "en",
  registerField: () => {},
  commitEdit: () => {},
});

export function useCmsEditMode() {
  return useContext(CmsEditModeContext);
}

/**
 * Wraps the whole site tree. When the page is loaded inside the admin CMS iframe
 * (?cms_edit=1), this activates inline edit mode: text/images tagged with
 * data-cms-section/data-cms-field become directly editable, and edits are posted
 * up to the parent admin frame via postMessage instead of hitting the API directly —
 * the parent owns save/dirty-state so it can show one unified "unsaved changes" UI.
 */
export function CmsEditModeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const knownFields = useRef<Set<string>>(new Set());

  useEffect(() => {
    const isEdit = searchParams.get("cms_edit") === "1";
    setActive(isEdit);
    const l = searchParams.get("cms_lang");
    if (l === "ar" || l === "en") setLang(l);
  }, [searchParams]);

  useEffect(() => {
    if (!active) return;
    // Tell the parent we're ready to receive edit-mode messages.
    window.parent?.postMessage({ type: "cms-ready" }, window.location.origin);
  }, [active]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "cms-refresh") {
        clearSiteContentCache();
        window.location.reload();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const registerField = useCallback((sectionId: string, fieldId: string, currentValue: string) => {
    const key = `${sectionId}.${fieldId}`;
    if (knownFields.current.has(key)) return;
    knownFields.current.add(key);
    window.parent?.postMessage(
      { type: "cms-field-seen", sectionId, fieldId, value: currentValue },
      window.location.origin
    );
  }, []);

  const commitEdit = useCallback((sectionId: string, fieldId: string, value: string) => {
    const edit: PendingEdit = { sectionId, fieldId, lang, value };
    window.parent?.postMessage({ type: "cms-edit", edit }, window.location.origin);
  }, [lang]);

  return (
    <CmsEditModeContext.Provider value={{ active, lang, registerField, commitEdit }}>
      {children}
    </CmsEditModeContext.Provider>
  );
}
