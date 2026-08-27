"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Clock,
  Sparkles,
  Play,
  FileText,
  Calendar,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  rest: string | null;
  instructions: string | null;
  notes: string | null;
  sortOrder: number;
};

type Day = {
  id: string;
  name: string;
  dayLabel: string | null;
  focus: string | null;
  isRestDay: boolean;
  notes: string | null;
  sortOrder: number;
  exercises: Exercise[];
};

type Program = {
  id: string;
  title: string;
  description: string | null;
  split: string;
  totalWeeks: number;
  isPublished: boolean;
  publishedAt: string | null;
  days: Day[];
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  // New Program Modal
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [newProgramForm, setNewProgramForm] = useState({
    title: "",
    split: "Push / Pull / Legs",
    description: "",
    totalWeeks: 12,
  });

  // New Day Modal
  const [showNewDay, setShowNewDay] = useState(false);
  const [newDayForm, setNewDayForm] = useState({
    name: "",
    dayLabel: "Day 1",
    focus: "",
    isRestDay: false,
    notes: "",
  });

  // Exercise Modal
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<{ dayId: string; ex?: Exercise } | null>(null);
  const [exForm, setExForm] = useState({
    name: "",
    sets: 3,
    reps: "8-12",
    rest: "90 sec",
    instructions: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/admin/programs");
      const d = await res.json();
      const list: Program[] = d.programs || [];
      setPrograms(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
      }
    } catch {}
    setLoading(false);
  };

  const fetchSingleProgram = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/programs/${id}`);
      const d = await res.json();
      setProgram(d.program);
    } catch {}
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchSingleProgram(selectedId);
    }
  }, [selectedId]);

  async function handleCreateProgram(e: React.FormEvent) {
    e.preventDefault();
    if (!newProgramForm.title) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProgramForm),
      });
      const d = await res.json();
      setShowNewProgram(false);
      setNewProgramForm({ title: "", split: "Push / Pull / Legs", description: "", totalWeeks: 12 });
      await fetchPrograms();
      if (d.program?.id) setSelectedId(d.program.id);
    } catch {}
    setSaving(false);
  }

  async function handleAddDay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !newDayForm.name) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/programs/${selectedId}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDayForm),
      });
      setShowNewDay(false);
      setNewDayForm({ name: "", dayLabel: "", focus: "", isRestDay: false, notes: "" });
      fetchSingleProgram(selectedId);
    } catch {}
    setSaving(false);
  }

  async function handleSaveExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !activeDayId || !exForm.name) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/programs/${selectedId}/days/${activeDayId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...exForm, sets: +exForm.sets }),
      });
      setEditingExercise(null);
      setActiveDayId(null);
      setExForm({ name: "", sets: 3, reps: "8-12", rest: "90 sec", instructions: "", notes: "" });
      fetchSingleProgram(selectedId);
    } catch {}
    setSaving(false);
  }

  async function handleDeleteExercise(id: string) {
    if (!selectedId || !confirm("Remove this exercise from the workout?")) return;
    try {
      await fetch(`/api/admin/exercises/${id}`, { method: "DELETE" });
      fetchSingleProgram(selectedId);
    } catch {}
  }

  async function handleDeleteDay(dayId: string) {
    if (!selectedId || !confirm("Delete this training day and all its exercises?")) return;
    try {
      await fetch(`/api/admin/programs/${selectedId}/days/${dayId}`, { method: "DELETE" });
      fetchSingleProgram(selectedId);
    } catch {}
  }

  async function togglePublish() {
    if (!selectedId || !program) return;
    try {
      await fetch(`/api/admin/programs/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !program.isPublished }),
      });
      fetchSingleProgram(selectedId);
      fetchPrograms();
    } catch {}
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* Sidebar: Programs List */}
      <div className="w-full lg:w-72 shrink-0 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm p-4 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Layers size={14} className="text-[var(--accent)]" /> Training Programs
            </h3>
            <button
              onClick={() => setShowNewProgram(true)}
              className="p-1.5 rounded-sm bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors"
              title="Create Program"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="space-y-1.5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-[var(--bg-elevated)] rounded-sm animate-pulse" />
              ))
            ) : programs.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center py-6">No programs created yet.</p>
            ) : (
              programs.map((p) => {
                const active = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full text-left p-3 rounded-sm transition-all border ${
                      active
                        ? "bg-[var(--accent)]/10 border-[var(--accent)]/40 text-[var(--text-primary)] shadow-sm"
                        : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs truncate">{p.title}</p>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          p.isPublished
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {p.isPublished ? "Live" : "Draft"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">{p.split}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <button
          onClick={() => setShowNewProgram(true)}
          className="w-full py-2 border border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-sm text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={14} /> New Split
        </button>
      </div>

      {/* Program Details & Workout Builder */}
      <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm p-6 overflow-y-auto">
        {!program ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <Dumbbell size={36} className="mb-3 opacity-40 text-[var(--accent)]" />
            <p className="text-sm font-semibold">Select or create a training program to begin editing.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black text-[var(--text-primary)]">{program.title}</h2>
                  <span className="px-2.5 py-0.5 rounded-sm bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/30">
                    {program.split}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {program.totalWeeks} Weeks Program · {program.days?.length || 0} Training Days
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePublish}
                  className={`px-4 py-2 text-xs font-black rounded-sm border transition-colors flex items-center gap-1.5 ${
                    program.isPublished
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                      : "bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25"
                  }`}
                >
                  {program.isPublished ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {program.isPublished ? "Published (Live for Clients)" : "Draft (Unpublished)"}
                </button>

                <button
                  onClick={() => setShowNewDay(true)}
                  className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} /> Add Training Day
                </button>
              </div>
            </div>

            {/* Days & Exercises List */}
            <div className="space-y-4">
              {program.days?.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-sm text-[var(--text-muted)]">
                  <Calendar size={28} className="mx-auto mb-2 opacity-50 text-[var(--accent)]" />
                  <p className="text-sm font-semibold">No training days added yet</p>
                  <p className="text-xs mt-1">Add Day 1 (e.g. Push or Upper) to start building exercises.</p>
                  <button
                    onClick={() => setShowNewDay(true)}
                    className="mt-4 px-4 py-2 bg-[var(--accent)] text-black text-xs font-bold rounded-sm"
                  >
                    + Add Day 1
                  </button>
                </div>
              ) : (
                program.days?.map((day) => (
                  <div
                    key={day.id}
                    className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm overflow-hidden"
                  >
                    {/* Day Header */}
                    <div className="px-5 py-3.5 bg-[var(--bg-base)] border-b border-[var(--border)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-sm bg-[var(--accent)]/10 text-[var(--accent)] font-mono font-bold text-xs flex items-center justify-center">
                          {day.dayLabel || "D"}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">{day.name}</h4>
                          {day.focus && <p className="text-[11px] text-[var(--text-muted)]">{day.focus}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveDayId(day.id);
                            setEditingExercise({ dayId: day.id });
                          }}
                          className="px-3 py-1 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold rounded-sm flex items-center gap-1 transition-colors"
                        >
                          <Plus size={13} /> Add Exercise
                        </button>

                        <button
                          onClick={() => handleDeleteDay(day.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          title="Delete Day"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Exercises Table */}
                    <div className="p-4">
                      {day.exercises?.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] text-center py-4">
                          No exercises added for this day. Click &quot;Add Exercise&quot; above.
                        </p>
                      ) : (
                        <div className="divide-y divide-[var(--border)]">
                          {day.exercises?.map((ex, idx) => (
                            <div
                              key={ex.id}
                              className="py-3 flex items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0 group"
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-mono text-xs font-bold text-[var(--text-muted)] mt-0.5">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-[var(--text-primary)]">{ex.name}</p>
                                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1">
                                    <span className="text-[var(--accent)] font-semibold">
                                      {ex.sets || 3} Sets
                                    </span>
                                    <span>•</span>
                                    <span>{ex.reps || "8-12"} Reps</span>
                                    <span>•</span>
                                    <span>{ex.rest || "90s"} Rest</span>
                                  </div>
                                  {ex.instructions && (
                                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                                      💡 {ex.instructions}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteExercise(ex.id)}
                                className="p-1.5 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Exercise"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Program Modal */}
      {showNewProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-accent)] rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Create Training Split</h3>
              <button onClick={() => setShowNewProgram(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Program Title *</label>
                <input
                  required
                  value={newProgramForm.title}
                  onChange={(e) => setNewProgramForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. THE AMAR - 12 Week Hypertrophy"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Split Type</label>
                <input
                  value={newProgramForm.split}
                  onChange={(e) => setNewProgramForm((f) => ({ ...f, split: e.target.value }))}
                  placeholder="e.g. Push / Pull / Legs"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Duration (Weeks)</label>
                <input
                  type="number"
                  value={newProgramForm.totalWeeks}
                  onChange={(e) => setNewProgramForm((f) => ({ ...f, totalWeeks: +e.target.value }))}
                  placeholder="12"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors disabled:opacity-50"
                >
                  {saving ? "Creating…" : "Create Program"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProgram(false)}
                  className="px-4 py-2 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Day Modal */}
      {showNewDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-accent)] rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Add Training Day</h3>
              <button onClick={() => setShowNewDay(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDay} className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Day Title *</label>
                <input
                  required
                  value={newDayForm.name}
                  onChange={(e) => setNewDayForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Push A — Chest Focus"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Day Label / Tag</label>
                <input
                  value={newDayForm.dayLabel}
                  onChange={(e) => setNewDayForm((f) => ({ ...f, dayLabel: e.target.value }))}
                  placeholder="e.g. Day 1 or Monday"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Muscle Focus</label>
                <input
                  value={newDayForm.focus}
                  onChange={(e) => setNewDayForm((f) => ({ ...f, focus: e.target.value }))}
                  placeholder="e.g. Upper Chest, Side Delts, Triceps"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors disabled:opacity-50"
                >
                  {saving ? "Adding…" : "Add Day"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewDay(false)}
                  className="px-4 py-2 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Exercise Modal */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-accent)] rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Add Exercise</h3>
              <button
                onClick={() => setEditingExercise(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Exercise Name *</label>
                <input
                  required
                  value={exForm.name}
                  onChange={(e) => setExForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Incline DB Press"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Sets</label>
                  <input
                    type="number"
                    value={exForm.sets}
                    onChange={(e) => setExForm((f) => ({ ...f, sets: +e.target.value }))}
                    placeholder="3"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Reps</label>
                  <input
                    value={exForm.reps}
                    onChange={(e) => setExForm((f) => ({ ...f, reps: e.target.value }))}
                    placeholder="8-12"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Rest</label>
                  <input
                    value={exForm.rest}
                    onChange={(e) => setExForm((f) => ({ ...f, rest: e.target.value }))}
                    placeholder="90 sec"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Coaching Cues & Instructions</label>
                <textarea
                  rows={3}
                  value={exForm.instructions}
                  onChange={(e) => setExForm((f) => ({ ...f, instructions: e.target.value }))}
                  placeholder="e.g. Slow 3s eccentric, pause 1s at the bottom stretch, explode up."
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Exercise"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="px-4 py-2 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
