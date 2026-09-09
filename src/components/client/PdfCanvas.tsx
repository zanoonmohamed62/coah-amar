"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, WifiOff, ZoomIn, ZoomOut, RotateCcw, Lock, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/use-settings";
import {
  getCachedPdf,
  getCachedVersion,
  probeSplitAccess,
  clearOtherUsersCache,
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
  const user = session?.user as { id?: string; name?: string; email?: string } | undefined;
  const watermarkText = user?.email || user?.name || "";
  // The cache is keyed by user id so one account's downloaded copy is never
  // readable by another account signed in on the same device.
  const userId = user?.id ?? "";
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

  // Screenshot blocking was removed deliberately.
  //
  // It could not work: a browser cannot stop the operating system's capture,
  // so anyone could still photograph the screen with a second phone or use the
  // OS snipping tool. What it did do was hide the plan for two seconds whenever
  // the window lost focus — which fired constantly on a phone (notification,
  // app switch, screen rotate) and blanked the plan mid-set. It also blocked
  // Ctrl+C and text selection for paying customers.
  //
  // The real deterrent is the per-viewer watermark drawn on every page above:
  // it makes any leaked copy traceable to the account that opened it.

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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Bake DPR into the viewport so pdfjs handles all scaling internally.
      // Never call ctx.setTransform(dpr) separately — that causes double-scaling
      // which garbles glyph advances (letter spacing).
      const viewport = page.getViewport({ scale: computedScale });
      const dprViewport = page.getViewport({ scale: computedScale * dpr });

      // Physical canvas pixels = dpr * CSS pixels
      canvas.width  = Math.floor(dprViewport.width);
      canvas.height = Math.floor(dprViewport.height);
      canvas.style.width  = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Match overlay to CSS size
      overlay.style.width  = `${Math.floor(viewport.width)}px`;
      overlay.style.height = `${Math.floor(viewport.height)}px`;
      overlay.innerHTML = "";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // No manual ctx.setTransform — pdfjs owns the transform

      const task = page.render({
        canvasContext: ctx,
        viewport: dprViewport,
        intent: "display",
      });

      renderTasks.current[pageIndex] = task;
      await task.promise;
      renderTasks.current[pageIndex] = null;

      drawWatermark(ctx, dprViewport.width, dprViewport.height, watermarkText);

      // Build annotation (link) overlay (use CSS-sized viewport for positions)
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

  // Turn raw PDF bytes into a rendered document.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openPdf = useCallback(async (pdfjsLib: any, buf: ArrayBuffer) => {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buf.slice(0)),
      cMapUrl: "/pdfjs/cmaps/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "/pdfjs/standard_fonts/standard_fonts/",
      enableXfa: true,
      // Render fonts directly onto canvas instead of CSS @font-face.
      // Fixes glyph width mismatches that cause garbled letter spacing.
      disableFontFace: true,
      useSystemFonts: false,
    });

    const pdf = await loadingTask.promise;
    pdfRef.current = pdf;
    setNumPages(pdf.numPages);
    setStatus("ready");
  }, []);

  // Load PDF document (pdfjs v4)
  //
  // Cache-first: a cached copy renders immediately without waiting on any
  // network call, then the version check runs in the background and only
  // re-downloads if the admin actually replaced the file. Previously the
  // version request was awaited *before* the cached bytes were used, so every
  // open paused on the network (which reads as "it's downloading again") and
  // offline it had to fail that request first.
  const loadDocument = useCallback(async () => {
    setStatus("loading");
    setErrMsg("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      // pdfjs v4 uses .mjs worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

      // No user id means no session yet — nothing to read and nothing to key a
      // cache by.
      if (!userId) {
        setStatus("no-access");
        return;
      }

      // Ask the server first, before anything from IndexedDB reaches the
      // screen. A cached PDF used to be rendered immediately and only
      // *afterwards* revalidated, so a device that had cached the file for a
      // paying customer would show it to the next account signed in on that
      // browser — including one that had never bought anything. The server
      // always refused GET /api/split; the viewer just never asked.
      const probe = await probeSplitAccess();
      if (probe.state === "denied") {
        // Revoked, expired, or never entitled: drop anything held locally so
        // the file cannot be read again from this device.
        await clearOtherUsersCache("");
        setStatus("no-access");
        return;
      }

      // Remove copies belonging to other accounts on this device.
      await clearOtherUsersCache(userId);

      const [cachedBuf, cachedVersion] = await Promise.all([
        getCachedPdf(userId),
        getCachedVersion(userId),
      ]);

      // Offline: the probe couldn't run, so fall back to this user's own cached
      // copy. It was only ever written after an authenticated, entitled fetch.
      if (probe.state === "offline") {
        if (cachedBuf) {
          await openPdf(pdfjsLib, cachedBuf);
          return;
        }
        throw new Error("offline-no-cache");
      }

      if (cachedBuf) {
        await openPdf(pdfjsLib, cachedBuf);

        // Access is already confirmed; this only refreshes a stale version.
        if (cachedVersion !== probe.version) {
          void (async () => {
            try {
              const res = await fetch("/api/split", { cache: "no-store" });
              if (!res.ok) return;
              const fresh = await res.arrayBuffer();
              if (fresh.byteLength === 0) return;
              await savePdfToCache(userId, fresh, probe.version);
              await openPdf(pdfjsLib, fresh);
            } catch { /* keep showing the cached copy */ }
          })();
        }
        return;
      }

      // No cache yet — must fetch before anything can render.
      const res = await fetch("/api/split", { cache: "no-store" });
      if (res.status === 403 || res.status === 401) {
        setStatus("no-access");
        return;
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const buf = await res.arrayBuffer();
      await savePdfToCache(userId, buf, probe.version);
      await openPdf(pdfjsLib, buf);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PdfCanvas]", msg);
      setErrMsg(msg);
      setStatus("error");
    }
  }, [openPdf, userId]);

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
        {/* Zoom controls. Sized min-w/h-10 (40px) rather than the p-1 they used
            to be (~22px): this is the toolbar of the actual product, used on a
            phone in a gym, and a 22px target is not reliably tappable. */}
        <div className="flex items-center gap-1 bg-white/5 px-1.5 py-1 rounded-[var(--radius-md)] border border-white/10">
          <button
            onClick={() => handleZoom(-0.15)}
            aria-label={isArabic ? "تصغير" : "Zoom out"}
            className="min-w-10 min-h-10 flex items-center justify-center hover:bg-white/10 active:bg-white/20 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[11px] font-mono text-[var(--text-muted)] w-10 text-center tabular-nums">
            {Math.round(scaleMultiplier * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.15)}
            aria-label={isArabic ? "تكبير" : "Zoom in"}
            className="min-w-10 min-h-10 flex items-center justify-center hover:bg-white/10 active:bg-white/20 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          {scaleMultiplier !== 1 && (
            <button
              onClick={() => setScaleMultiplier(1)}
              aria-label={isArabic ? "إعادة الحجم" : "Reset zoom"}
              className="min-w-10 min-h-10 flex items-center justify-center hover:bg-white/10 active:bg-white/20 rounded-[var(--radius-sm)] text-blue-400 transition-colors"
            >
              <RotateCcw size={16} />
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
        // Pages are drawn to <canvas>, so there is no selectable text to copy
        // anyway; dragging the canvas out as an image is the one thing worth
        // preventing, and it costs the customer nothing.
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-5 w-full">
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
                  className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-black rounded-[var(--radius-lg)] flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  {isArabic ? "اشتري الجدول" : "Buy the Split"}
                </a>
                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(isArabic ? "مرحباً، مش قادر أشوف الجدول بتاعي" : "Hi, I can't see my split")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-white/5 border border-white/10 text-[var(--text-secondary)] text-sm font-bold rounded-[var(--radius-lg)] flex items-center gap-2 hover:bg-white/10 transition-colors"
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
              <button onClick={loadDocument} className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-black rounded-[var(--radius-lg)]">
                {isArabic ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}

          {status === "ready" && Array.from({ length: numPages }, (_, i) => (
            <div key={i} id={`pdf-page-${i + 1}`} className="relative rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-card)] bg-white max-w-full border border-white/5">
              <canvas ref={(el) => { canvasRefs.current[i] = el; }} style={{ display: "block", maxWidth: "100%" }} />
              <div ref={(el) => { overlayRefs.current[i] = el; }} className="absolute inset-0 z-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}