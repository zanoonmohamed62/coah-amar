"use client";

import { useLanguage } from "@/lib/language-context";

export function TrustStrip() {
  const { t } = useLanguage();
  const items = t.trust.items;
  const doubled = [...items, ...items];

  return (
    <section className="py-10 border-y border-[var(--border)] overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--bg-primary)_0%,transparent_10%,transparent_90%,var(--bg-primary)_100%)] z-10 pointer-events-none" />
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <span
              className="text-xs font-semibold tracking-[0.2em] uppercase px-6 text-[var(--text-muted)]"
            >
              {item}
            </span>
            <span className="text-[var(--accent)] text-xs opacity-40">·</span>
          </div>
        ))}
      </div>
    </section>
  );
}
