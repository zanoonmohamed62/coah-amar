"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, ChevronRight, Coffee, Zap } from "lucide-react";

type Day = { id: string; name: string; dayLabel: string | null; focus: string | null; isRestDay: boolean; sortOrder: number; _count: { exercises: number } };
type Program = { id: string; title: string; description: string | null; split: string; totalWeeks: number; days: Day[] };

export default function MySplitPage() {
  const [data, setData] = useState<{ program: Program; programId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get entitlements first, then fetch the program for the first active entitlement
    fetch("/api/customer/entitlements").then(r => r.json()).then(async d => {
      const active = (d.entitlements || []).filter((e: { status: string; isExpired: boolean }) => e.status === "ACTIVE" && !e.isExpired);
      if (!active.length) { setError("No active plan found. Purchase a training split to get started."); setLoading(false); return; }

      // Find training program linked to product
      const res = await fetch(`/api/customer/entitlements/program`);
      const prog = await res.json();
      if (prog.error) { setError(prog.error); setLoading(false); return; }
      setData(prog);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass border border-[var(--border)] rounded-sm h-20 animate-pulse" />)}</div>;
  if (error) return <div className="glass border border-[var(--border)] rounded-sm p-10 text-center"><p className="text-[var(--text-secondary)]">{error}</p><Link href="/" className="btn-primary inline-block mt-4 px-5 py-2 text-sm">Get a Plan →</Link></div>;
  if (!data) return null;

  const { program, programId } = data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{program.title}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">{program.split} · {program.totalWeeks} week{program.totalWeeks > 1 ? "s" : ""}</p>
        {program.description && <p className="text-[var(--text-secondary)] text-sm mt-3 max-w-xl">{program.description}</p>}
      </div>

      <div className="grid gap-3">
        {program.days.map((day, idx) => (
          day.isRestDay ? (
            <div key={day.id} className="glass border border-[var(--border)] rounded-sm p-4 flex items-center gap-3 opacity-60">
              <div className="w-8 h-8 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">{idx + 1}</div>
              <Coffee size={16} className="text-[var(--text-muted)]" />
              <div>
                <p className="font-semibold text-[var(--text-secondary)] text-sm">{day.name}</p>
                {day.dayLabel && <p className="text-xs text-[var(--text-muted)]">{day.dayLabel}</p>}
              </div>
              <span className="ml-auto text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-sm">REST</span>
            </div>
          ) : (
            <Link key={day.id} href={`/app/my-split/${day.id}?programId=${programId}`}
              className="glass border border-[var(--border)] hover:border-[var(--border-accent)] rounded-sm p-4 flex items-center gap-3 transition-all group hover:bg-[var(--accent-glow)]">
              <div className="w-8 h-8 bg-[var(--accent-glow)] border border-[var(--border-accent)] rounded-sm flex items-center justify-center text-xs font-bold text-[var(--accent)]">{idx + 1}</div>
              <Dumbbell size={16} className="text-[var(--accent)] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text-primary)] text-sm">{day.name}</p>
                {day.focus && <p className="text-xs text-[var(--text-muted)] truncate">{day.focus}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[var(--text-muted)]">{day._count.exercises} exercises</span>
                <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
