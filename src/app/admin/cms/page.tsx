"use client";

import { useEffect, useState, useRef } from "react";
import { Save, Eye, Send, ChevronDown } from "lucide-react";

const SECTIONS = [
  { id: "hero", label: "Hero", fields: [{ id: "headline", label: "Headline" }, { id: "subheadline", label: "Subheadline" }, { id: "cta_text", label: "CTA Button Text" }, { id: "video_url", label: "Video URL" }] },
  { id: "pricing", label: "Pricing", fields: [{ id: "product1_name", label: "Product 1 Name" }, { id: "product1_price", label: "Product 1 Price" }, { id: "product1_description", label: "Product 1 Description" }, { id: "product2_name", label: "Product 2 Name" }, { id: "product2_price", label: "Product 2 Price" }, { id: "product2_renewal_price", label: "Renewal Price" }] },
  { id: "coach", label: "Coach", fields: [{ id: "name", label: "Coach Name" }, { id: "biography", label: "Biography" }, { id: "credentials", label: "Credentials" }, { id: "image_url", label: "Photo URL" }] },
  { id: "testimonials", label: "Testimonials", fields: [{ id: "testimonial_1_quote", label: "Testimonial 1 Quote" }, { id: "testimonial_1_name", label: "Testimonial 1 Name" }, { id: "testimonial_2_quote", label: "Testimonial 2 Quote" }, { id: "testimonial_2_name", label: "Testimonial 2 Name" }, { id: "testimonial_3_quote", label: "Testimonial 3 Quote" }, { id: "testimonial_3_name", label: "Testimonial 3 Name" }] },
  { id: "faq", label: "FAQ", fields: [{ id: "q1", label: "Q1" }, { id: "a1", label: "A1" }, { id: "q2", label: "Q2" }, { id: "a2", label: "A2" }, { id: "q3", label: "Q3" }, { id: "a3", label: "A3" }, { id: "q4", label: "Q4" }, { id: "a4", label: "A4" }] },
  { id: "footer", label: "Footer", fields: [{ id: "copyright", label: "Copyright Text" }, { id: "instagram_url", label: "Instagram URL" }, { id: "tiktok_url", label: "TikTok URL" }, { id: "youtube_url", label: "YouTube URL" }] },
  { id: "how_it_works", label: "How It Works", fields: [{ id: "step1_title", label: "Step 1 Title" }, { id: "step1_desc", label: "Step 1 Description" }, { id: "step2_title", label: "Step 2 Title" }, { id: "step2_desc", label: "Step 2 Description" }, { id: "step3_title", label: "Step 3 Title" }, { id: "step3_desc", label: "Step 3 Description" }] },
];

type ContentMap = Record<string, Record<string, string>>;

export default function CMSPage() {
  const [content, setContent] = useState<ContentMap>({});
  const [drafts, setDrafts] = useState<ContentMap>({});
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms").then(r => r.json()).then(d => {
      const map: ContentMap = {};
      const draftMap: ContentMap = {};
      for (const row of d.content || []) {
        if (!map[row.sectionId]) map[row.sectionId] = {};
        if (!draftMap[row.sectionId]) draftMap[row.sectionId] = {};
        map[row.sectionId][row.fieldId] = row.value;
        draftMap[row.sectionId][row.fieldId] = row.draftValue || row.value;
      }
      setContent(map); setDrafts(draftMap);
    });
  }, []);

  function getVal(sectionId: string, fieldId: string) { return drafts[sectionId]?.[fieldId] ?? content[sectionId]?.[fieldId] ?? ""; }

  function setVal(sectionId: string, fieldId: string, value: string) {
    setDrafts(d => ({ ...d, [sectionId]: { ...(d[sectionId] || {}), [fieldId]: value } }));
  }

  async function saveDrafts() {
    setSaving(true);
    const section = SECTIONS.find(s => s.id === activeSection)!;
    for (const field of section.fields) {
      const value = getVal(activeSection, field.id);
      await fetch("/api/admin/cms", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionId: activeSection, fieldId: field.id, lang: "en", value, draft: true }) });
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function publishAll() {
    setPublishing(true);
    // First save all drafts
    for (const section of SECTIONS) {
      for (const field of section.fields) {
        const value = getVal(section.id, field.id);
        if (value) await fetch("/api/admin/cms", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionId: section.id, fieldId: field.id, lang: "en", value, draft: false }) });
      }
    }
    await fetch("/api/admin/cms/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setPublishing(false);
  }

  const section = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="flex gap-0 h-[calc(100vh-4rem)] -m-8">
      {/* Left: Section tabs + editor */}
      <div className="w-1/2 border-r border-[var(--border)] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <h1 className="text-lg font-extrabold text-[var(--text-primary)]">Website CMS</h1>
          <div className="flex gap-2">
            <button onClick={saveDrafts} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-sm transition-colors disabled:opacity-50">
              <Save size={12} /> {saved ? "Saved!" : saving ? "Saving…" : "Save Draft"}
            </button>
            <button onClick={publishAll} disabled={publishing} className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50">
              <Send size={12} /> {publishing ? "Publishing…" : "Publish All"}
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-4 py-3 border-b border-[var(--border)] overflow-x-auto shrink-0">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1 text-xs rounded-sm whitespace-nowrap transition-colors ${activeSection === s.id ? "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--border-accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Fields editor */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {section.fields.map(field => (
            <div key={field.id}>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">{field.label}</label>
              {field.id.includes("biography") || field.id.includes("description") || field.id.includes("a1") || field.id.includes("a2") || field.id.includes("a3") || field.id.includes("a4") ? (
                <textarea value={getVal(activeSection, field.id)} onChange={e => setVal(activeSection, field.id, e.target.value)} rows={3}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] resize-y" />
              ) : (
                <input value={getVal(activeSection, field.id)} onChange={e => setVal(activeSection, field.id, e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-1/2 flex flex-col">
        <div className="px-4 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center gap-2 shrink-0">
          <Eye size={14} className="text-[var(--accent)]" />
          <span className="text-sm font-bold text-[var(--text-primary)]">Live Preview</span>
          <span className="text-xs text-[var(--text-muted)] ml-2">Reflects published content</span>
        </div>
        <iframe src="/?preview=1" className="flex-1 w-full border-0 bg-white" title="Website Preview" />
      </div>
    </div>
  );
}
