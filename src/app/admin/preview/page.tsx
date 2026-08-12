"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, RefreshCw } from "lucide-react";

export default function PreviewPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState("/");

  const refresh = () => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; };
  const open = () => window.open(url, "_blank");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-8">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
        <h1 className="text-base font-extrabold text-[var(--text-primary)]">Live Preview</h1>
        <div className="flex-1 flex items-center gap-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-sm px-3 py-1.5">
          <span className="text-xs text-[var(--text-muted)]">coachair.com</span>
          <select value={url} onChange={e => setUrl(e.target.value)} className="flex-1 bg-transparent text-xs text-[var(--text-primary)] focus:outline-none">
            <option value="/">Homepage</option>
            <option value="/app">Customer Portal</option>
            <option value="/app/my-split">My Split</option>
            <option value="/checkout">Checkout</option>
            <option value="/admin">Admin Overview</option>
          </select>
        </div>
        <button onClick={refresh} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><RefreshCw size={14} /></button>
        <button onClick={open} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><Maximize2 size={14} /></button>
      </div>
      <div className="flex-1 bg-white">
        <iframe ref={iframeRef} src={url} className="w-full h-full border-0" title="Preview" />
      </div>
    </div>
  );
}
