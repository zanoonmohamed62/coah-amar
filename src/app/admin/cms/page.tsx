"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pencil, Eye, Save, Loader2, ExternalLink, Globe,
  CheckCircle2, AlertTriangle, RefreshCw, Smartphone, Monitor,
} from "lucide-react";

type PendingEdit = { sectionId: string; fieldId: string; lang: "en" | "ar"; value: string };

/**
 * The whole CMS is just the real homepage, shown at full size in an iframe.
 * "Edit mode" tells the page (via ?cms_edit=1) to make every CMS-linked text/image
 * directly editable in place — no separate form, no field list. Edits are captured
 * here via postMessage and saved through the same /api/admin/cms/batch endpoint the
 * old form-based editor used, so the data model and publish path are unchanged.
 */
const EDITABLE_PAGES = [
  { path: "/", label: "Home" },
  { path: "/checkout/split", label: "Split Checkout" },
  { path: "/checkout/coaching", label: "Coaching Checkout" },
] as const;

export default function CMSPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [page, setPage] = useState<string>(EDITABLE_PAGES[0].path);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [editMode, setEditMode] = useState(true);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [pending, setPending] = useState<Record<string, PendingEdit>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A ref mirror of `pending` so handleSave can read the truly-latest edits
  // after an async flush round-trip, instead of a value closed over at click time.
  const pendingRef = useRef<Record<string, PendingEdit>>({});
  useEffect(() => { pendingRef.current = pending; }, [pending]);

  const dirtyCount = Object.keys(pending).length;

  const showToast = useCallback((type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const iframeSrc = `${page}?cms_edit=${editMode ? "1" : "0"}&cms_lang=${lang}`;

  // Listen for edits posted up from the page running inside the iframe.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "cms-ready") {
        setIframeReady(true);
      } else if (e.data?.type === "cms-edit") {
        const edit: PendingEdit = e.data.edit;
        const key = `${edit.sectionId}.${edit.fieldId}.${edit.lang}`;
        setPending((prev) => ({ ...prev, [key]: edit }));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    setIframeReady(false);
  }, [lang, editMode, page]);

  // Ask the iframe to blur whatever's currently focused (forcing its onBlur
  // commit to fire) and wait for its ack before reading pending edits — this
  // closes the race where clicking Save right after typing could read a
  // stale, empty pending list because postMessage delivery is asynchronous.
  function flushAndWait(): Promise<void> {
    return new Promise((resolve) => {
      let done = false;
      function finish() {
        if (done) return;
        done = true;
        window.removeEventListener("message", onAck);
        resolve();
      }
      function onAck(e: MessageEvent) {
        if (e.origin !== window.location.origin) return;
        if (e.data?.type === "cms-flush-ack") finish();
      }
      window.addEventListener("message", onAck);
      iframeRef.current?.contentWindow?.postMessage({ type: "cms-flush" }, window.location.origin);
      // Safety net in case the iframe never acks (e.g. not loaded yet).
      setTimeout(finish, 250);
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await flushAndWait();
      const updates = Object.values(pendingRef.current);
      if (updates.length === 0) {
        showToast("err", "No changes to save.");
        return;
      }
      const res = await fetch("/api/admin/cms/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error();
      setPending({});
      showToast("ok", `Saved ${updates.length} change${updates.length > 1 ? "s" : ""}`);
      iframeRef.current?.contentWindow?.postMessage({ type: "cms-refresh" }, window.location.origin);
    } catch {
      showToast("err", "Save failed — please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setPending({});
    iframeRef.current?.contentWindow?.postMessage({ type: "cms-refresh" }, window.location.origin);
  }

  return (
    <>
      <style>{`.cms-full { margin: -2rem; height: calc(100vh - 64px); display: flex; flex-direction: column; overflow: hidden; }`}</style>
      <div className="cms-full">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] border text-sm font-semibold shadow-[var(--shadow-card)] ${
              toast.type === "ok"
                ? "bg-emerald-950 border-emerald-500/50 text-emerald-300"
                : "bg-red-950 border-red-500/50 text-red-300"
            }`}
          >
            {toast.type === "ok" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {toast.msg}
          </div>
        )}

        {/* Toolbar */}
        <header
          style={{
            height: 52,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(10,12,16,0.97)",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#f1f5f9", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Site Editor
            </span>
            {dirtyCount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "2px 8px", borderRadius: "var(--radius-pill)" }}>
                {dirtyCount} unsaved
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Page selector */}
            <select
              value={page}
              onChange={(e) => {
                if (dirtyCount > 0 && !confirm("You have unsaved changes that will be lost. Switch page anyway?")) return;
                setPending({});
                setPage(e.target.value);
              }}
              style={{
                padding: "6px 10px", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)", color: "#f1f5f9", fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}
            >
              {EDITABLE_PAGES.map((p) => (
                <option key={p.path} value={p.path} style={{ background: "#0a0c10" }}>{p.label}</option>
              ))}
            </select>

            {/* Edit / Preview toggle */}
            <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", overflow: "hidden", fontSize: 11 }}>
              <button
                onClick={() => setEditMode(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontWeight: 700, cursor: "pointer", border: "none",
                  background: editMode ? "var(--accent,#caf02b)" : "transparent",
                  color: editMode ? "#000" : "rgba(255,255,255,0.5)",
                }}
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontWeight: 700, cursor: "pointer", border: "none",
                  background: !editMode ? "var(--accent,#caf02b)" : "transparent",
                  color: !editMode ? "#000" : "rgba(255,255,255,0.5)",
                }}
              >
                <Eye size={14} /> Preview
              </button>
            </div>

            {/* Language toggle */}
            <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", overflow: "hidden", fontSize: 11 }}>
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    if (dirtyCount > 0 && !confirm("You have unsaved changes that will be lost. Switch language anyway?")) return;
                    setPending({});
                    setLang(l);
                  }}
                  style={{
                    padding: "6px 12px", fontWeight: 700, cursor: "pointer", border: "none",
                    background: lang === l ? "var(--accent,#caf02b)" : "transparent",
                    color: lang === l ? "#000" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {l === "en" ? "🇬🇧 EN" : "🇪🇬 AR"}
                </button>
              ))}
            </div>

            {/* Viewport toggle */}
            <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <button onClick={() => setViewport("desktop")} style={{ padding: "6px 9px", border: "none", cursor: "pointer", background: viewport === "desktop" ? "rgba(202,240,43,0.12)" : "transparent", color: viewport === "desktop" ? "var(--accent,#caf02b)" : "rgba(255,255,255,0.4)" }} title="Desktop">
                <Monitor size={14} />
              </button>
              <button onClick={() => setViewport("mobile")} style={{ padding: "6px 9px", border: "none", cursor: "pointer", background: viewport === "mobile" ? "rgba(202,240,43,0.12)" : "transparent", color: viewport === "mobile" ? "var(--accent,#caf02b)" : "rgba(255,255,255,0.4)" }} title="Mobile">
                <Smartphone size={14} />
              </button>
            </div>

            <button
              onClick={() => iframeRef.current && (iframeRef.current.src = iframeRef.current.src)}
              style={{ padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>

            <a
              href={page}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
            >
              <ExternalLink size={14} /> Open Live Site
            </a>

            {dirtyCount > 0 && (
              <button
                onClick={handleDiscard}
                disabled={saving}
                style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                Discard
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving || dirtyCount === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
                background: "var(--accent,#caf02b)", color: "#000", border: "none", borderRadius: "var(--radius-md)",
                fontWeight: 900, fontSize: 12, cursor: "pointer",
                opacity: saving || dirtyCount === 0 ? 0.4 : 1,
              }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save {dirtyCount > 0 && <span style={{ background: "rgba(0,0,0,0.2)", fontSize: 10, fontWeight: 900, padding: "1px 6px", borderRadius: "var(--radius-pill)" }}>{dirtyCount}</span>}
            </button>
          </div>
        </header>

        {/* Site frame */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", overflow: "auto", background: "#141720", position: "relative" }}>
          {editMode && !iframeReady && (
            <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(10,12,16,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              <Loader2 size={14} className="animate-spin" /> Loading editor…
            </div>
          )}
          <div
            style={{
              width: viewport === "mobile" ? 420 : "100%",
              height: "100%",
              background: "#07090e",
              boxShadow: viewport === "mobile" ? "0 0 0 1px rgba(255,255,255,0.1)" : undefined,
            }}
          >
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title="Site Editor"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
