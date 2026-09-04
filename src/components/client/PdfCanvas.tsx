"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, WifiOff, ZoomIn, ZoomOut, RotateCcw, Lock, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/use-settings";
import {
  getCachedPdf,
  getCachedVersion,
  fetchCurrentVersion,
  savePdfToCache,
} from "@/lib/split-cache";

// IndexedDB access lives in @/lib/split-cache so the background prefetcher
// (SplitPrefetcher) and this viewer share one set of keys and can't drift.

// Deters leaks by making any copy traceable to the customer who viewed it.
// Drawn fresh onto every rendered page from the live session — never baked
// into a stored file — so it can't be captured once and stripped for reuse.
function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  if (!text) return;
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#3b82f6";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const angle = -Math.PI / 6;
  const stepX = 240;
  const stepY = 130;

  for (let y = -stepY; y < height + stepY; y += stepY) {
    for (let x = -stepX; x < width + stepX; x += stepX) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

interface Props {
  isArabic: boolean;
}

export default function PdfCanvas({ isArabic }: Props) {
  const session = useSession()?.data;
  const user = session?.user as { name?: string; email?: string } | undefined;
  const watermarkText = user?.email || user?.name || "";
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const viewerRef   = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef      = useRef<any>(null);
  const canvasRefs  = useRef<(HTMLCanvasElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTasks = useRef<{ [key: number]: any }>({});
  const resizeTimer = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "no-access">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [isBlurred, setIsBlurred] = useState(false);

  // 1. Anti-Screenshot & DRM
  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibility = () => setIsBlurred(document.hidden);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen, F10, Ctrl+P, Ctrl+S, CMD+Shift+3, CMD+Shift+4, CMD+Shift+S
      if (
        e.key === "PrintScreen" ||
        e.key === "F10" ||
        (e.ctrlKey && (e.key === "p" || e.key === "s" || e.key === "c")) ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5" || e.key === "s"))
      ) {
        e.preventDefault();
        
        // Synchronous DOM Hiding (Faster than OS screen buffer capture)
        if (viewerRef.current) {
          viewerRef.current.style.opacity = "0";
          viewerRef.current.style.visibility = "hidden";
        }
        
        setIsBlurred(true);
        
        // Restore after 2 seconds
        setTimeout(() => {
          if (viewerRef.current) {
            viewerRef.current.style.opacity = "1";
            viewerRef.current.style.visibility = "visible";
          }
          setIsBlurred(false);
        }, 2000);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Render a single page with annotation links
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPage = useCallback(async (pageNum: number, containerWidth: number, zoom: number) => {
    const pdf = pdfRef.current;
    if (!pdf) return;

    const pageIndex = pageNum - 1;
    const canvas = canvasRefs.current[pageIndex];
    const overlay = overlayRefs.current[pageIndex];
    if (!canvas || !overlay) return;

    // Cancel existing render task
    if (renderTasks.current[pageIndex]) {
      try { renderTasks.current[pageIndex].cancel(); } catch { /* ignore */ }
      renderTasks.current[pageIndex] = null;
    }

    try {
      const page = await pdf.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });

      const targetWidth = Math.max((containerWidth - 32) * zoom, 280);
      const computedScale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale: computedScale });
      const dpr = Math.min(window.devicePixelRatio || 2, 2.5);

      // Set canvas dimensions
      canvas.width  = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width  = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Match overlay to canvas
      overlay.style.width  = `${Math.floor(viewport.width)}px`;
      overlay.style.height = `${Math.floor(viewport.height)}px`;
      overlay.innerHTML = "";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const task = page.render({
        canvasContext: ctx,
        viewport,
        intent: "display",
      });

      renderTasks.current[pageIndex] = task;
      await task.promise;
      renderTasks.current[pageIndex] = null;

      drawWatermark(ctx, viewport.width, viewport.height, watermarkText);

      // Build annotation (link) overlay
      const annotations = await page.getAnnotations();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      annotations.forEach((anno: any) => {
        if (anno.subtype !== "Link" || !anno.rect) return;

        const rect = viewport.convertToViewportRectangle(anno.rect);
        const x = Math.min(rect[0], rect[2]);
        const y = Math.min(rect[1], rect[3]);
        const w = Math.abs(rect[2] - rect[0]);
        const h = Math.abs(rect[3] - rect[1]);

        const a = document.createElement("a");
        a.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;cursor:pointer;`;

        if (anno.url) {
          a.href = anno.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        } else if (anno.dest) {
          a.href = "#";
          a.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              let dest = anno.dest;
              if (typeof dest === "string") dest = await pdfRef.current.getDestination(dest);
              if (dest) {
                const idx = await pdfRef.current.getPageIndex(dest[0]);
                document.getElementById(`pdf-page-${idx + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            } catch { /* ignore */ }
          });
        }
        overlay.appendChild(a);
      });

    } catch (err: unknown) {
      if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "RenderingCancelledException") return;
      console.warn(`[PdfCanvas] Page ${pageNum} render issue:`, err);
    }
  }, [watermarkText]);

  const renderAll = useCallback(async () => {
    if (!pdfRef.current || !viewerRef.current) return;
    const containerW = viewerRef.current.clientWidth;
    for (let i = 1; i <= pdfRef.current.numPages; i++) {
      await renderPage(i, containerW, scaleMultiplier);
    }
  }, [renderPage, scaleMultiplier]);

  // Load PDF document (pdfjs v4)
  const loadDocument = useCallback(async () => {
    setStatus("loading");
    setErrMsg("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      // pdfjs v4 uses .mjs worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

      const [cachedBuf, cachedVersion, currentVersion] = await Promise.all([
        getCachedPdf(),
        getCachedVersion(),
        fetchCurrentVersion(),
      ]);

      // Reuse the cached copy only if we know for certain it's still current.
      // If the version check fails (offline), trust whatever is cached rather
      // than blocking the viewer.
      const cacheIsStale = currentVersion !== null && cachedVersion !== null && currentVersion !== cachedVersion;

      let buf = cachedBuf && !cacheIsStale ? cachedBuf : null;
      if (!buf) {
        const res = await fetch("/api/split", { cache: "no-store" });
        if (res.status === 403) {
          setStatus("no-access");
          return;
        }
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        buf = await res.arrayBuffer();
        await savePdfToCache(buf, currentVersion ?? "legacy");
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buf.slice(0)),
        cMapUrl: "/pdfjs/cmaps/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "/pdfjs/standard_fonts/standard_fonts/",
        enableXfa: true,
        disableFontFace: false,
      });

      const pdf = await loadingTask.promise;
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
      setStatus("ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PdfCanvas]", msg);
      setErrMsg(msg);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadDocument();
    return () => {
      Object.values(renderTasks.current).forEach((t) => { try { t?.cancel(); } catch { /* */ } });
    };
  }, [loadDocument]);

  useEffect(() => {
    if (status === "ready" && numPages > 0) {
      const t = setTimeout(() => renderAll(), 60);
      return () => clearTimeout(t);
    }
  }, [status, numPages, renderAll]);

  // Debounced resize
  useEffect(() => {
    if (!viewerRef.current) return;
    let lastW = viewerRef.current.clientWidth;
    const ro = new ResizeObserver(() => {
      if (status !== "ready" || !viewerRef.current) return;
      const w = viewerRef.current.clientWidth;
      if (Math.abs(w - lastW) < 10) return;
      lastW = w;
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => renderAll(), 250);
    });
    ro.observe(viewerRef.current);
    return () => { ro.disconnect(); if (resizeTimer.current) clearTimeout(resizeTimer.current); };
  }, [status, renderAll]);

  const handleZoom = (d: number) => setScaleMultiplier((p) => Math.min(Math.max(+(p + d).toFixed(2), 0.7), 2.0));

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[#0b0f17] flex items-center justify-between text-xs shrink-0 z-20 select-none">
        {/* Offline caching is deliberately silent — the customer shouldn't have
            to think about downloads, so no status badge is shown here. */}
        <div className="flex items-center gap-2" />
        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-sm border border-white/10">
          <button onClick={() => handleZoom(-0.15)} className="p-1 hover:bg-white/10 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors">
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-9 text-center">{Math.round(scaleMultiplier * 100)}%</span>
          <button onClick={() => handleZoom(0.15)} className="p-1 hover:bg-white/10 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors">
            <ZoomIn size={14} />
          </button>
          {scaleMultiplier !== 1 && (
            <button onClick={() => setScaleMultiplier(1)} className="p-1 hover:bg-white/10 rounded-sm text-blue-400 transition-colors ml-1">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Print block */}
      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print-pdf { display: none !important; } }` }} />

      {/* Viewer Area */}
      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print-pdf { display: none !important; } }` }} />
      <div
        ref={viewerRef}
        className="no-print-pdf flex-1 w-full overflow-y-auto bg-[#070a0f] flex flex-col items-center gap-5 p-4 relative"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        {isBlurred && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl">
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl flex flex-col items-center max-w-sm text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🚫</span>
              </div>
              <h2 className="text-xl font-black text-red-500 mb-2">
                {isArabic ? "تصوير الشاشة محظور" : "Screenshots Disabled"}
              </h2>
              <p className="text-sm text-red-400/80 font-medium">
                {isArabic 
                  ? "لأسباب تتعلق بحقوق الملكية الفكرية، لا يُسمح بتصوير أو نسخ محتوى الجدول."
                  : "For copyright reasons, taking screenshots or copying this material is strictly prohibited."}
              </p>
            </div>
          </div>
        )}

        <div className={`flex flex-col items-center gap-5 w-full transition-all duration-300 ${isBlurred ? 'opacity-0 scale-95 pointer-events-none blur-xl' : 'opacity-100 scale-100'}`}>
          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#070a0f] z-10">
              <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
              <p className="text-sm font-semibold text-[var(--text-muted)]">
                {isArabic ? "جاري تحميل الجدول..." : "Loading split..."}
              </p>
            </div>
          )}

          {status === "no-access" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#070a0f] z-10 px-6 text-center">
              <Lock size={40} className="text-amber-400" />
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-bold text-[var(--text-primary)]">
                  {isArabic ? "لسه معندكش وصول لهذا الجدول" : "You don't have access to this split yet"}
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed mx-auto">
                  {isArabic
                    ? "لو دفعت بالفعل، الطلب لسه بيتراجع. لو لسه معنديش اشتريه دلوقتي."
                    : "If you've already paid, your order may still be under review. Otherwise, get it now."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href="/#split"
                  className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-black rounded-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  {isArabic ? "اشتري الجدول" : "Buy the Split"}
                </a>
                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(isArabic ? "مرحباً، مش قادر أشوف الجدول بتاعي" : "Hi, I can't see my split")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-white/5 border border-white/10 text-[var(--text-secondary)] text-sm font-bold rounded-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    <MessageCircle size={14} />
                    {isArabic ? "تواصل عبر واتساب" : "Contact on WhatsApp"}
                  </a>
                )}
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070a0f] z-10 px-6 text-center">
              <WifiOff size={36} className="text-red-400" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {isArabic ? "تعذر تحميل الجدول" : "Failed to load"}
              </p>
              {errMsg && (
                <p className="text-[11px] text-[var(--text-muted)] font-mono max-w-xs break-words">{errMsg}</p>
              )}
              <button onClick={loadDocument} className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-black rounded-sm">
                {isArabic ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}

          {status === "ready" && Array.from({ length: numPages }, (_, i) => (
            <div key={i} id={`pdf-page-${i + 1}`} className="relative rounded-sm overflow-hidden shadow-2xl bg-white max-w-full border border-white/5">
              <canvas ref={(el) => { canvasRefs.current[i] = el; }} style={{ display: "block", maxWidth: "100%" }} />
              <div ref={(el) => { overlayRefs.current[i] = el; }} className="absolute inset-0 z-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}