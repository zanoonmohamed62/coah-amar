"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, Trash2, Image as ImageIcon, Film, Copy } from "lucide-react";

type Asset = { id: string; filename: string; originalName: string; mimeType: string; size: number; isProtected: boolean; createdAt: string };

export default function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = () => fetch("/api/admin/media").then(r => r.json()).then(d => { setAssets(d.assets || []); setLoading(false); });
  useEffect(() => { fetchAssets(); }, []);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append("file", file); fd.append("isProtected", "true");
      await fetch("/api/admin/media", { method: "POST", body: fd });
    }
    setUploading(false); fetchAssets();
  }

  async function del(id: string) {
    if (!confirm("Delete asset?")) return;
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    fetchAssets();
  }

  const isVideo = (mime: string) => mime.startsWith("video/");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Media Library</h1>
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
          <Upload size={15} /> {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => handleUpload(e.target.files)} />
      </div>

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        className={`glass border-2 border-dashed border-[var(--border)] rounded-sm p-8 text-center mb-6 transition-colors ${uploading ? "border-[var(--border-accent)]" : "hover:border-[var(--border-accent)]"}`}>
        <Upload size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
        <p className="text-sm text-[var(--text-muted)]">Drop images or videos here, or click Upload</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">All media is protected by default (requires entitlement)</p>
      </div>

      {loading ? <div className="grid grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="glass border border-[var(--border)] rounded-sm aspect-square animate-pulse" />)}</div> :
        assets.length === 0 ? <div className="text-center py-16 text-[var(--text-muted)]">No media uploaded yet.</div> :
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {assets.map(a => (
            <div key={a.id} className="glass border border-[var(--border)] rounded-sm overflow-hidden group relative">
              <div className="aspect-square bg-[var(--bg-elevated)] flex items-center justify-center overflow-hidden">
                {isVideo(a.mimeType)
                  ? <Film size={32} className="text-[var(--text-muted)]" />
                  : <img src={`/api/media/${a.id}`} alt={a.originalName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                }
              </div>
              <div className="p-2">
                <p className="text-xs text-[var(--text-secondary)] truncate">{a.originalName}</p>
                <p className="text-xs text-[var(--text-muted)]">{(a.size / 1024).toFixed(0)} KB</p>
              </div>
              <div className="absolute inset-0 bg-[var(--bg-base)]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => navigator.clipboard.writeText(a.id)} className="p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]" title="Copy ID"><Copy size={13} /></button>
                <button onClick={() => del(a.id)} className="p-2 bg-[var(--bg-elevated)] border border-red-500/30 rounded-sm text-red-400 hover:bg-red-500/10" title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
