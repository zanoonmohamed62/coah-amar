"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Save,
  Eye,
  Send,
  Type,
  Image as ImageIcon,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Monitor,
  LayoutTemplate,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Section & Field Definitions
// ─────────────────────────────────────────────────────────────

type FieldDef = {
  id: string;
  label: string;
  type: "text" | "textarea" | "image" | "url";
  hint?: string;
};

type SectionDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  fields: FieldDef[];
};

const SECTIONS: SectionDef[] = [
  {
    id: "hero",
    label: "Hero Section",
    emoji: "🏠",
    description: "The first thing visitors see — headline, subtext, stats and CTA buttons.",
    fields: [
      { id: "badge", label: "Badge Text", type: "text", hint: 'e.g. X "MÉTHODE"' },
      { id: "titleLine1", label: "Headline Line 1", type: "text", hint: "e.g. THE AMMAR" },
      { id: "titleLine2", label: "Headline Line 2", type: "text", hint: 'e.g. "X SPLIT"' },
      { id: "titleLine3", label: "Headline Line 3", type: "text", hint: "e.g. BUILD DIFFERENT" },
      { id: "description", label: "Hero Description", type: "textarea", hint: "Subheadline text below the main title" },
      { id: "startBtn", label: "Start Button Text", type: "text", hint: "e.g. Start Your Transformation" },
      { id: "meetBtn", label: "Meet Button Text", type: "text", hint: "e.g. Let's Talk" },
      { id: "stat1Value", label: "Stat 1 — Number", type: "text", hint: "e.g. 100+" },
      { id: "stat1Label", label: "Stat 1 — Label", type: "text", hint: "e.g. Clients Coached" },
      { id: "stat2Value", label: "Stat 2 — Number", type: "text", hint: "e.g. 95%" },
      { id: "stat2Label", label: "Stat 2 — Label", type: "text", hint: "e.g. Completion Rate" },
      { id: "heroImage", label: "Hero Background / Coach Image URL", type: "image", hint: "Paste a direct image URL or Supabase URL" },
    ],
  },
  {
    id: "coach",
    label: "Coach Section",
    emoji: "👤",
    description: "The About the Coach section — bio, credentials, and portrait photo.",
    fields: [
      { id: "name", label: "Coach Name", type: "text", hint: "e.g. Coach Amar" },
      { id: "sub", label: "Coach Title / Credentials", type: "text", hint: "e.g. Certified Fitness Coach · Sports Nutritionist" },
      { id: "bio", label: "Coach Biography", type: "textarea", hint: "The full bio paragraph displayed on the site" },
      { id: "point1", label: "Expertise Point 1", type: "text", hint: "e.g. Specialized in body recomposition..." },
      { id: "point2", label: "Expertise Point 2", type: "text", hint: "e.g. Evidence-based approach..." },
      { id: "point3", label: "Expertise Point 3", type: "text", hint: "e.g. Hands-on weekly monitoring..." },
      { id: "portraitImage", label: "Coach Portrait Photo URL", type: "image", hint: "Paste direct URL to portrait image" },
      { id: "igUrl", label: "Instagram Profile URL", type: "url", hint: "https://instagram.com/your.handle" },
      { id: "btn", label: "CTA Button Text", type: "text", hint: "e.g. Start Coaching With Amar" },
    ],
  },
  {
    id: "pricing",
    label: "Pricing / Plans",
    emoji: "💳",
    description: "The two offer cards — Training Plan and Personal Coaching pricing & features.",
    fields: [
      { id: "offer1_title", label: "Plan 1 — Title", type: "text", hint: "e.g. TRAINING PLAN" },
      { id: "offer1_sub", label: "Plan 1 — Subtitle", type: "text", hint: "e.g. Do It Yourself" },
      { id: "offer1_price", label: "Plan 1 — Price", type: "text", hint: "e.g. 399" },
      { id: "offer1_currency", label: "Plan 1 — Currency Label", type: "text", hint: "e.g. LE / 19 €" },
      { id: "offer1_btn", label: "Plan 1 — CTA Button Text", type: "text", hint: "e.g. Get The Plan — 399 LE" },
      { id: "offer1_features", label: "Plan 1 — Features (one per line)", type: "textarea", hint: "Each line = one bullet point" },
      { id: "offer2_title", label: "Plan 2 — Title", type: "text", hint: "e.g. PERSONAL COACHING" },
      { id: "offer2_sub", label: "Plan 2 — Subtitle", type: "text", hint: "e.g. Full System · 3 Months" },
      { id: "offer2_price", label: "Plan 2 — Price", type: "text", hint: "e.g. 1,399" },
      { id: "offer2_currency", label: "Plan 2 — Currency Label", type: "text", hint: "e.g. LE / 79 €" },
      { id: "offer2_btn", label: "Plan 2 — CTA Button Text", type: "text", hint: "e.g. Start Coaching — 1,399 LE" },
      { id: "offer2_renewal", label: "Plan 2 — Renewal Text", type: "text", hint: "e.g. Renewal: 999 LE / 69 € / 3 months" },
      { id: "offer2_features", label: "Plan 2 — Features (one per line)", type: "textarea", hint: "Each line = one bullet point" },
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    emoji: "⭐",
    description: "Client results and review quotes displayed in the social proof section.",
    fields: [
      { id: "t1_name", label: "Review 1 — Client Name", type: "text", hint: "e.g. Ahmed M." },
      { id: "t1_duration", label: "Review 1 — Duration / Plan", type: "text", hint: "e.g. 12 Weeks · Coaching" },
      { id: "t1_result", label: "Review 1 — Result Badge", type: "text", hint: "e.g. −14 kg" },
      { id: "t1_text", label: "Review 1 — Quote", type: "textarea", hint: "The full testimonial text" },
      { id: "t2_name", label: "Review 2 — Client Name", type: "text" },
      { id: "t2_duration", label: "Review 2 — Duration / Plan", type: "text" },
      { id: "t2_result", label: "Review 2 — Result Badge", type: "text" },
      { id: "t2_text", label: "Review 2 — Quote", type: "textarea" },
      { id: "t3_name", label: "Review 3 — Client Name", type: "text" },
      { id: "t3_duration", label: "Review 3 — Duration / Plan", type: "text" },
      { id: "t3_result", label: "Review 3 — Result Badge", type: "text" },
      { id: "t3_text", label: "Review 3 — Quote", type: "textarea" },
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    emoji: "❓",
    description: "Frequently asked questions shown in the collapsible accordion section.",
    fields: [
      { id: "q1", label: "Question 1", type: "text" },
      { id: "a1", label: "Answer 1", type: "textarea" },
      { id: "q2", label: "Question 2", type: "text" },
      { id: "a2", label: "Answer 2", type: "textarea" },
      { id: "q3", label: "Question 3", type: "text" },
      { id: "a3", label: "Answer 3", type: "textarea" },
      { id: "q4", label: "Question 4", type: "text" },
      { id: "a4", label: "Answer 4", type: "textarea" },
      { id: "q5", label: "Question 5", type: "text" },
      { id: "a5", label: "Answer 5", type: "textarea" },
    ],
  },
  {
    id: "howItWorks",
    label: "How It Works",
    emoji: "📋",
    description: "Step-by-step process explanation for training plan and coaching tracks.",
    fields: [
      { id: "title", label: "Section Title", type: "text", hint: "e.g. How It Works" },
      { id: "subtitle", label: "Section Subtitle", type: "textarea" },
      { id: "step1_title", label: "Plan Step 1 — Title", type: "text", hint: "e.g. Purchase" },
      { id: "step1_desc", label: "Plan Step 1 — Description", type: "text" },
      { id: "step2_title", label: "Plan Step 2 — Title", type: "text" },
      { id: "step2_desc", label: "Plan Step 2 — Description", type: "text" },
      { id: "step3_title", label: "Plan Step 3 — Title", type: "text" },
      { id: "step3_desc", label: "Plan Step 3 — Description", type: "text" },
    ],
  },
  {
    id: "footer",
    label: "Footer & Links",
    emoji: "🔗",
    description: "Footer text, social media links, and copyright.",
    fields: [
      { id: "copyright", label: "Copyright Text", type: "text", hint: "e.g. © 2025 Coach Amar. All rights reserved." },
      { id: "brand", label: "Brand Name in Footer", type: "text", hint: "e.g. Coach Amar" },
      { id: "instagram_url", label: "Instagram URL", type: "url", hint: "https://instagram.com/..." },
      { id: "tiktok_url", label: "TikTok URL", type: "url" },
      { id: "youtube_url", label: "YouTube URL", type: "url" },
    ],
  },
  {
    id: "nav",
    label: "Navigation",
    emoji: "🧭",
    description: "Navbar menu items and call-to-action button text.",
    fields: [
      { id: "brand", label: "Brand Name (Logo Text)", type: "text", hint: "e.g. Coach Amar" },
      { id: "plans", label: "Plans Link Text", type: "text", hint: "e.g. Plans" },
      { id: "coach", label: "Coach Link Text", type: "text", hint: "e.g. Coach" },
      { id: "results", label: "Results Link Text", type: "text", hint: "e.g. Results" },
      { id: "faq", label: "FAQ Link Text", type: "text", hint: "e.g. FAQ" },
      { id: "startNow", label: "CTA Button Text", type: "text", hint: "e.g. Start Now" },
    ],
  },
];

type ContentMap = Record<string, Record<string, string>>;

export default function CMSPage() {
  const [saved, setSaved] = useState<ContentMap>({});
  const [edits, setEdits] = useState<ContentMap>({});
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [previewWidth, setPreviewWidth] = useState<"full" | "mobile">("full");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load all saved content from DB
  const loadContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms");
      const d = await res.json();
      const map: ContentMap = {};
      for (const row of d.content || []) {
        if (!map[row.sectionId]) map[row.sectionId] = {};
        map[row.sectionId][row.fieldId] = row.draftValue ?? row.value;
      }
      setSaved(map);
      setEdits(map);
    } catch {}
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  function getVal(sectionId: string, fieldId: string) {
    return edits[sectionId]?.[fieldId] ?? saved[sectionId]?.[fieldId] ?? "";
  }

  function setVal(sectionId: string, fieldId: string, value: string) {
    setEdits((d) => ({ ...d, [sectionId]: { ...(d[sectionId] || {}), [fieldId]: value } }));
  }

  function isDirty(sectionId: string, fieldId: string) {
    const current = edits[sectionId]?.[fieldId] ?? "";
    const original = saved[sectionId]?.[fieldId] ?? "";
    return current !== original;
  }

  const sectionHasDirty = (sectionId: string) => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    return section?.fields.some((f) => isDirty(sectionId, f.id)) ?? false;
  };

  // Save all fields in the current section
  async function saveSection() {
    setSaving(true);
    const section = SECTIONS.find((s) => s.id === activeSection)!;
    try {
      for (const field of section.fields) {
        const value = getVal(activeSection, field.id);
        await fetch("/api/admin/cms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: activeSection,
            fieldId: field.id,
            lang: "en",
            value,
            draft: false, // Publish immediately — simpler UX
          }),
        });
      }

      // Update saved state
      setSaved((prev) => ({ ...prev, [activeSection]: { ...(prev[activeSection] || {}), ...(edits[activeSection] || {}) } }));

      setSaveMsg("Saved & Published ✓");
      setTimeout(() => setSaveMsg(null), 3000);

      // Refresh the preview iframe
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    } catch {
      setSaveMsg("Error saving. Try again.");
    }
    setSaving(false);
  }

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const currentSection = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="flex h-[calc(100vh-4.5rem)] -m-8 overflow-hidden">
      {/* ─── LEFT PANEL: Section Nav + Fields ─── */}
      <div className="w-[420px] shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg-card)]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <LayoutTemplate size={16} className="text-[var(--accent)]" /> Page Editor
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Select a section, edit, then save. Changes go live instantly.</p>
          </div>
        </div>

        {/* Section Pills */}
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-base)] shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => {
              const dirty = sectionHasDirty(s.id);
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold transition-all ${
                    active
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)]"
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                  {dirty && !active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Description */}
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-base)] shrink-0">
          <p className="text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">{currentSection.emoji} {currentSection.label}</span>
            {" — "}{currentSection.description}
          </p>
        </div>

        {/* Field Editors */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {currentSection.fields.map((field) => {
            const val = getVal(activeSection, field.id);
            const dirty = isDirty(activeSection, field.id);

            return (
              <div key={field.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    {field.type === "image" && <ImageIcon size={12} className="text-blue-400" />}
                    {field.type === "url" && <ExternalLink size={12} className="text-purple-400" />}
                    {field.type === "text" && <Type size={12} className="text-[var(--accent)]" />}
                    {field.type === "textarea" && <Type size={12} className="text-emerald-400" />}
                    {field.label}
                  </label>
                  {dirty && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                      Unsaved
                    </span>
                  )}
                </div>

                {field.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={val}
                    onChange={(e) => setVal(activeSection, field.id, e.target.value)}
                    placeholder={field.hint || `Enter ${field.label.toLowerCase()}...`}
                    className={`w-full bg-[var(--bg-elevated)] border rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none resize-y transition-colors ${
                      dirty ? "border-amber-500/50 focus:border-amber-400" : "border-[var(--border)] focus:border-[var(--border-accent)]"
                    }`}
                  />
                ) : field.type === "image" ? (
                  <div className="space-y-2">
                    <input
                      value={val}
                      onChange={(e) => setVal(activeSection, field.id, e.target.value)}
                      placeholder={field.hint || "Paste direct image URL..."}
                      className={`w-full bg-[var(--bg-elevated)] border rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none font-mono transition-colors ${
                        dirty ? "border-amber-500/50 focus:border-amber-400" : "border-[var(--border)] focus:border-[var(--border-accent)]"
                      }`}
                    />
                    {val && (
                      <div className="relative rounded-sm overflow-hidden border border-[var(--border)] bg-[var(--bg-base)] aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={val}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <button
                          onClick={() => setVal(activeSection, field.id, "")}
                          className="absolute top-2 right-2 p-1 bg-black/60 rounded text-white hover:bg-black/80 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-[var(--text-muted)]">
                      💡 Upload to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Supabase Storage</a> and paste the public URL here.
                    </p>
                  </div>
                ) : (
                  <input
                    type={field.type === "url" ? "url" : "text"}
                    value={val}
                    onChange={(e) => setVal(activeSection, field.id, e.target.value)}
                    placeholder={field.hint || `Enter ${field.label.toLowerCase()}...`}
                    className={`w-full bg-[var(--bg-elevated)] border rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none transition-colors ${
                      dirty ? "border-amber-500/50 focus:border-amber-400" : "border-[var(--border)] focus:border-[var(--border-accent)]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Save Footer */}
        <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 space-y-2">
          {saveMsg && (
            <div className={`text-xs font-bold px-3 py-2 rounded-sm border ${
              saveMsg.includes("✓")
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {saveMsg}
            </div>
          )}
          <button
            onClick={saveSection}
            disabled={saving}
            className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {saving ? "Saving…" : `Save & Publish — ${currentSection.emoji} ${currentSection.label}`}
          </button>
          <p className="text-[10px] text-[var(--text-muted)] text-center">
            Changes go live immediately and refresh the preview →
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Live Site Preview ─── */}
      <div className="flex-1 flex flex-col bg-[var(--bg-base)] overflow-hidden">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">Live Site Preview</span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1 bg-[var(--bg-base)] border border-[var(--border)] px-2 py-0.5 rounded-full">
              Reflects Published Content
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewWidth("full")}
              className={`p-1.5 rounded-sm border transition-colors ${previewWidth === "full" ? "border-[var(--border-accent)] text-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
              title="Desktop preview"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setPreviewWidth("mobile")}
              className={`p-1.5 rounded-sm border transition-colors ${previewWidth === "mobile" ? "border-[var(--border-accent)] text-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
              title="Mobile preview"
            >
              <Smartphone size={14} />
            </button>
            <div className="w-px h-5 bg-[var(--border)]" />
            <button
              onClick={refreshPreview}
              className="p-1.5 rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors"
              title="Refresh preview"
            >
              <RefreshCw size={14} />
            </button>
            <a
              href="/"
              target="_blank"
              className="p-1.5 rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--border-accent)] transition-colors"
              title="Open site in new tab"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Preview Frame */}
        <div className={`flex-1 flex justify-center bg-[#111] overflow-auto ${previewWidth === "mobile" ? "py-6" : ""}`}>
          <div
            className={`h-full bg-white transition-all ${previewWidth === "mobile" ? "w-[390px] rounded-xl shadow-2xl overflow-hidden" : "w-full"}`}
          >
            <iframe
              ref={iframeRef}
              src="/"
              className="w-full h-full border-0"
              title="Website Preview"
            />
          </div>
        </div>

        {/* Preview Footer Hint */}
        <div className="px-5 py-2 border-t border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 flex items-center justify-between">
          <p className="text-[10px] text-[var(--text-muted)]">
            ℹ️ After saving, click <strong>Refresh</strong> (↻) if changes don&apos;t appear immediately.
          </p>
          <a
            href="/"
            target="_blank"
            className="text-[10px] text-[var(--accent)] hover:underline font-semibold flex items-center gap-1"
          >
            Open full site <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
