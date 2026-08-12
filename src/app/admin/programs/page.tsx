"use client";

import { useEffect, useState } from "react";
import { Plus, CheckCircle2, Circle, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

type Exercise = { id: string; name: string; sets: number | null; reps: string | null; rest: string | null; sortOrder: number };
type Day = { id: string; name: string; focus: string | null; isRestDay: boolean; sortOrder: number; exercises: Exercise[] };
type Program = { id: string; title: string; split: string; isPublished: boolean; days: Day[] };

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [newProgramForm, setNewProgramForm] = useState({ title: "", split: "Push / Pull / Legs", totalWeeks: 12 });
  const [showNewDay, setShowNewDay] = useState(false);
  const [newDayForm, setNewDayForm] = useState({ name: "", focus: "", isRestDay: false, sortOrder: 0 });
  const [addingExercise, setAddingExercise] = useState<string | null>(null);
  const [exForm, setExForm] = useState({ name: "", sets: 3, reps: "8-12", rest: "90 sec", instructions: "", notes: "" });
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/admin/programs").then(r => r.json()).then(d => setPrograms(d.programs || [])); }, []);
  useEffect(() => {
    if (!selected) return;
    fetch(`/api/admin/programs/${selected}`).then(r => r.json()).then(d => setProgram(d.program));
  }, [selected]);

  async function createProgram() {
    setSaving(true);
    const res = await fetch("/api/admin/programs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newProgramForm }) });
    const d = await res.json(); setSaving(false); setShowNewProgram(false);
    setPrograms(p => [...p, d.program]); setSelected(d.program.id);
  }

  async function addDay() {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/programs/${selected}/days`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newDayForm) });
    setSaving(false); setShowNewDay(false);
    const res = await fetch(`/api/admin/programs/${selected}`); setProgram((await res.json()).program);
  }

  async function addExercise(dayId: string) {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/programs/${selected}/days/${dayId}/exercises`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...exForm, sets: +exForm.sets }) });
    setSaving(false); setAddingExercise(null); setExForm({ name: "", sets: 3, reps: "8-12", rest: "90 sec", instructions: "", notes: "" });
    const res = await fetch(`/api/admin/programs/${selected}`); setProgram((await res.json()).program);
  }

  async function deleteExercise(id: string) {
    if (!selected || !confirm("Delete exercise?")) return;
    await fetch(`/api/admin/exercises/${id}`, { method: "DELETE" });
    const res = await fetch(`/api/admin/programs/${selected}`); setProgram((await res.json()).program);
  }

  async function deleteDay(dayId: string) {
    if (!selected || !confirm("Delete day and all exercises?")) return;
    await fetch(`/api/admin/programs/${selected}/days/${dayId}`, { method: "DELETE" });
    const res = await fetch(`/api/admin/programs/${selected}`); setProgram((await res.json()).program);
  }

  async function publish() {
    if (!selected) return;
    setPublishing(true);
    await fetch(`/api/admin/programs/${selected}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: true }) });
    setPublishing(false);
    const res = await fetch(`/api/admin/programs/${selected}`); setProgram((await res.json()).program);
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Programs list */}
      <div className="w-64 shrink-0 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-extrabold text-[var(--text-primary)]">Training Builder</h1>
          <button onClick={() => setShowNewProgram(!showNewProgram)} className="text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"><Plus size={18} /></button>
        </div>
        {showNewProgram && (
          <div className="glass border border-[var(--border-accent)] rounded-sm p-3 space-y-2">
            <input placeholder="Program name" value={newProgramForm.title} onChange={e => setNewProgramForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" />
            <input placeholder="Split (e.g. PPL)" value={newProgramForm.split} onChange={e => setNewProgramForm(f => ({ ...f, split: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" />
            <button onClick={createProgram} disabled={saving} className="w-full btn-primary py-1.5 text-xs">{saving ? "Creating…" : "Create"}</button>
          </div>
        )}
        {programs.map(p => (
          <button key={p.id} onClick={() => setSelected(p.id)} className={`w-full text-left px-3 py-2.5 rounded-sm text-sm transition-all ${selected === p.id ? "bg-[var(--accent-glow)] border border-[var(--border-accent)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"}`}>
            <p className="font-semibold">{p.title}</p>
            <p className="text-xs opacity-60">{p.isPublished ? "✅ Published" : "Draft"}</p>
          </button>
        ))}
      </div>

      {/* Builder */}
      {program ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--bg-base)] py-2 z-10">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{program.title}</h2>
              <p className="text-xs text-[var(--text-muted)]">{program.split}</p>
            </div>
            <div className="flex gap-2">
              {!program.isPublished && <button onClick={publish} disabled={publishing} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">{publishing ? "Publishing…" : "Publish"}</button>}
              {program.isPublished && <span className="text-emerald-400 text-sm flex items-center gap-1.5 px-3 py-2"><CheckCircle2 size={14} /> Published</span>}
              <button onClick={() => setShowNewDay(!showNewDay)} className="px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-sm flex items-center gap-1.5"><Plus size={14} /> Add Day</button>
            </div>
          </div>

          {showNewDay && (
            <div className="glass border border-[var(--border-accent)] rounded-sm p-4 mb-4 grid grid-cols-3 gap-3">
              <div className="col-span-2"><label className="text-xs text-[var(--text-muted)] block mb-1">Day Name</label><input value={newDayForm.name} onChange={e => setNewDayForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" placeholder="e.g. Day 1 — Push" /></div>
              <div><label className="text-xs text-[var(--text-muted)] block mb-1">Focus</label><input value={newDayForm.focus} onChange={e => setNewDayForm(f => ({ ...f, focus: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" placeholder="Chest, Shoulders" /></div>
              <div className="flex items-center gap-2"><label className="text-xs text-[var(--text-muted)]"><input type="checkbox" checked={newDayForm.isRestDay} onChange={e => setNewDayForm(f => ({ ...f, isRestDay: e.target.checked }))} className="mr-1.5" />Rest Day</label></div>
              <button onClick={addDay} disabled={saving} className="btn-primary py-1.5 text-xs">{saving ? "Adding…" : "Add Day"}</button>
            </div>
          )}

          <div className="space-y-4">
            {program.days.map(day => (
              <div key={day.id} className="glass border border-[var(--border)] rounded-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                  <GripVertical size={14} className="text-[var(--text-muted)]" />
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-primary)] text-sm">{day.name}</p>
                    {day.focus && <p className="text-xs text-[var(--accent)]">{day.focus}</p>}
                    {day.isRestDay && <span className="text-xs text-[var(--text-muted)]">Rest Day</span>}
                  </div>
                  <button onClick={() => setAddingExercise(addingExercise === day.id ? null : day.id)} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"><Plus size={12} />Exercise</button>
                  <button onClick={() => deleteDay(day.id)} className="text-red-400/50 hover:text-red-400 transition-colors ml-2"><Trash2 size={14} /></button>
                </div>

                {addingExercise === day.id && (
                  <div className="px-4 py-3 bg-[var(--accent-glow)] border-b border-[var(--border-accent)] grid grid-cols-4 gap-2">
                    <div className="col-span-2"><label className="text-xs text-[var(--text-muted)] block mb-1">Exercise Name</label><input value={exForm.name} onChange={e => setExForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" /></div>
                    {[["Sets","sets","number"],["Reps","reps","text"],["Rest","rest","text"]].map(([l,k,t]) => (
                      <div key={k}><label className="text-xs text-[var(--text-muted)] block mb-1">{l}</label><input type={t} value={(exForm as Record<string,unknown>)[k] as string} onChange={e => setExForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" /></div>
                    ))}
                    <div className="col-span-4"><label className="text-xs text-[var(--text-muted)] block mb-1">Instructions</label><textarea value={exForm.instructions} onChange={e => setExForm(f => ({ ...f, instructions: e.target.value }))} rows={2} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none resize-none" /></div>
                    <button onClick={() => addExercise(day.id)} disabled={saving} className="btn-primary py-1.5 text-xs col-span-2">{saving ? "Adding…" : "Add Exercise"}</button>
                    <button onClick={() => setAddingExercise(null)} className="col-span-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">Cancel</button>
                  </div>
                )}

                {!day.isRestDay && day.exercises.length === 0 && <div className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">No exercises yet. Click + Exercise to add.</div>}

                {day.exercises.map((ex, idx) => (
                  <div key={ex.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                    <span className="w-5 h-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm flex items-center justify-center text-xs font-bold text-[var(--text-muted)] shrink-0">{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{ex.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{ex.sets && `${ex.sets} sets`} {ex.reps && `× ${ex.reps}`} {ex.rest && `· ${ex.rest} rest`}</p>
                    </div>
                    <button onClick={() => deleteExercise(ex.id)} className="text-red-400/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
          {programs.length === 0 ? "Create your first training program →" : "Select a program to edit"}
        </div>
      )}
    </div>
  );
}
