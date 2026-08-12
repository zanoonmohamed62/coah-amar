"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Dumbbell, Timer, RotateCcw, FileText } from "lucide-react";

type Exercise = { id: string; name: string; sets: number | null; reps: string | null; rest: string | null; instructions: string | null; notes: string | null; imageId: string | null; videoId: string | null };
type Day = { id: string; name: string; dayLabel: string | null; focus: string | null; notes: string | null; exercises: Exercise[] };

export default function DayPage({ params }: { params: { dayId: string } }) {
  const [day, setDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId") || "";

  useEffect(() => {
    if (!programId) return;
    fetch(`/api/customer/training/${programId}/day/${params.dayId}`)
      .then(r => r.json()).then(d => { setDay(d.day); setLoading(false); });
  }, [params.dayId, programId]);

  if (loading) return <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass border border-[var(--border)] rounded-sm h-16 animate-pulse" />)}</div>;
  if (!day) return <div className="text-[var(--text-muted)]">Day not found.</div>;

  return (
    <div>
      <Link href="/app/my-split" className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm mb-6 transition-colors">
        <ChevronLeft size={15} /> Back to Split
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{day.name}</h1>
        {day.focus && <p className="text-[var(--accent)] text-sm font-semibold mt-1">{day.focus}</p>}
        {day.dayLabel && <p className="text-[var(--text-muted)] text-xs mt-0.5">{day.dayLabel}</p>}
        {day.notes && <p className="text-[var(--text-secondary)] text-sm mt-3 glass border border-[var(--border)] rounded-sm p-3">{day.notes}</p>}
      </div>

      <div className="space-y-3">
        {day.exercises.map((ex, idx) => (
          <div key={ex.id} className="glass border border-[var(--border)] rounded-sm overflow-hidden">
            <button onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--bg-elevated)] transition-colors">
              <span className="w-7 h-7 bg-[var(--accent-glow)] border border-[var(--border-accent)] rounded-sm flex items-center justify-center text-xs font-bold text-[var(--accent)] shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--text-primary)] text-sm">{ex.name}</p>
                <div className="flex gap-3 mt-0.5">
                  {ex.sets && <span className="text-xs text-[var(--text-muted)]">{ex.sets} sets</span>}
                  {ex.reps && <span className="text-xs text-[var(--text-muted)]">× {ex.reps}</span>}
                  {ex.rest && <span className="text-xs text-[var(--text-muted)] flex items-center gap-0.5"><Timer size={10} />{ex.rest}</span>}
                </div>
              </div>
              <div className={`w-4 h-4 border border-[var(--border)] rounded-sm transition-transform ${expanded === ex.id ? "rotate-45" : ""}`} style={{ backgroundImage: "linear-gradient(45deg,transparent 45%,var(--text-muted) 45%,var(--text-muted) 55%,transparent 55%),linear-gradient(-45deg,transparent 45%,var(--text-muted) 45%,var(--text-muted) 55%,transparent 55%)" }} />
            </button>

            {expanded === ex.id && (
              <div className="px-4 pb-4 border-t border-[var(--border)] pt-4 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {ex.sets && <div className="glass border border-[var(--border)] rounded-sm p-3 text-center"><p className="text-lg font-extrabold text-[var(--text-primary)]">{ex.sets}</p><p className="text-xs text-[var(--text-muted)]">Sets</p></div>}
                  {ex.reps && <div className="glass border border-[var(--border)] rounded-sm p-3 text-center"><p className="text-lg font-extrabold text-[var(--text-primary)]">{ex.reps}</p><p className="text-xs text-[var(--text-muted)]">Reps</p></div>}
                  {ex.rest && <div className="glass border border-[var(--border)] rounded-sm p-3 text-center"><p className="text-lg font-extrabold text-[var(--text-primary)]">{ex.rest}</p><p className="text-xs text-[var(--text-muted)]">Rest</p></div>}
                </div>

                {ex.videoId && (
                  <video controls className="w-full rounded-sm aspect-video bg-black" style={{ pointerEvents: "auto" }} controlsList="nodownload">
                    <source src={`/api/media/${ex.videoId}`} />
                  </video>
                )}
                {ex.imageId && !ex.videoId && (
                  <img src={`/api/media/${ex.imageId}`} alt={ex.name} className="w-full rounded-sm object-cover max-h-64 select-none" draggable={false} />
                )}
                {ex.instructions && (
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1"><FileText size={11} /> Instructions</p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{ex.instructions}</p>
                  </div>
                )}
                {ex.notes && (
                  <div className="bg-[var(--accent-glow)] border border-[var(--border-accent)] rounded-sm p-3">
                    <p className="text-xs text-[var(--accent)] font-semibold mb-1">Coach Note</p>
                    <p className="text-sm text-[var(--text-secondary)]">{ex.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
