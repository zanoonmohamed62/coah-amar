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
  // The page wrappers keep their height even when the canvas inside is freed,
  // so scroll position is measured against these, not the canvases.
  const pageRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTasks = useRef<{ [key: number]: any }>({});
  const resizeTimer = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "no-access">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  // Which page is on screen, and where the customer left off last time. Kept in
  // a ref as well so renderVisible can prioritise it without re-creating itself on
  // every scroll.
  const [currentPage, setCurrentPage] = useState(1);
  const currentPageRef = useRef(1);
  const restoredRef = useRef(false);
  // What each page was last drawn at (page -> "page:zoom:width"), so scrolling
  // back to an already-correct page is free instead of a re-render.
  const renderedRef = useRef<Map<number, string>>(new Map());
  // Aspect ratio of page 1, used to reserve height for pages that are not
  // rendered yet. Without it the placeholders have no height, the document
  // collapses, and scrolling jumps around.
  const [pageAspect, setPageAspect] = useState(1.414); // A4 portrait default

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

      // Full container width — the viewer no longer has padding around the
      // pages, so subtracting for it here would leave the plan narrower than
      // the screen and waste space on a phone.
      const targetWidth = Math.max(containerWidth * zoom, 280);
      const computedScale = targetWidth / baseViewport.width;
      // Cap at 1.5x on phones rather than 2x. Pixel count grows with the
      // square, so 2x costs ~78% more work and memory per page than 1.5x for a
      // difference that is not visible on a small screen — and that cost is
      // paid on every page draw, which is what makes the plan feel heavy.
      // Desktop keeps 2x, where there is headroom for it.
      const isPhone = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isPhone ? 1.5 : 2);

      // Bake DPR into the viewport so pdfjs handles all scaling internally.
      // Never call ctx.setTransform(dpr) separately — that causes double-scaling
      // which garbles glyph advances (letter spacing).
      const viewport = page.getViewport({ scale: computedScale });
      const dprViewport = page.getViewport({ scale: computedScale * dpr });

      // Draw into an off-screen canvas, then blit the finished page across in
      // one step. Assigning canvas.width clears it to transparent, so rendering
      // straight into the visible canvas made the page flash white for the
      // whole render — which is what looked like the page vanishing and
      // reloading. The visible canvas is only touched once the page is ready.
      const off = document.createElement("canvas");
      off.width  = Math.floor(dprViewport.width);
      off.height = Math.floor(dprViewport.height);
      // Fill the wrapper rather than setting a fixed pixel width. The wrapper
      // already reserves this page's box via aspect-ratio, and a hard px width
      // here would disagree with it by a pixel or two on some widths — enough
      // to shift the layout as each page finishes drawing.
      canvas.style.width  = "100%";
      canvas.style.height = "100%";

      const offCtx = off.getContext("2d");
      if (!offCtx) return;
      // No manual ctx.setTransform — pdfjs owns the transform

      const task = page.render({
        canvasContext: offCtx,
        viewport: dprViewport,
        intent: "display",
      });

      renderTasks.current[pageIndex] = task;
      await task.promise;
      renderTasks.current[pageIndex] = null;

      drawWatermark(offCtx, dprViewport.width, dprViewport.height, watermarkText);

      // Page is complete — swap it in. Only now does the visible canvas change,
      // so it never shows a partially drawn or empty page.
      canvas.width  = off.width;
      canvas.height = off.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(off, 0, 0);

      // Rebuild the link overlay against the freshly drawn page. Cleared here
      // rather than before the render so the old links stay clickable while the
      // new page is still being drawn.
      overlay.innerHTML = "";

      // Build annotation (link) overlay (use CSS-sized viewport for positions)
      // "display" only — the default also pulls print-intent annotations, which
      // this viewer never uses and which cost time on every page draw.
      const annotations = await page.getAnnotations({ intent: "display" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      annotations.forEach((anno: any) => {
        if (anno.subtype !== "Link" || !anno.rect) return;

        const rect = viewport.convertToViewportRectangle(anno.rect);
        const x = Math.min(rect[0], rect[2]);
        const y = Math.min(rect[1], rect[3]);
        const w = Math.abs(rect[2] - rect[0]);
        const h = Math.abs(rect[3] - rect[1]);

        // Percentages, not pixels: the canvas now fills its wrapper rather than
        // being sized in px, so a px-positioned link would drift out of place
        // whenever the rendered width and the wrapper width differ slightly.
        const pct = (v: number, total: number) => `${(v / total) * 100}%`;

        const a = document.createElement("a");
        a.style.cssText =
          `position:absolute;left:${pct(x, viewport.width)};top:${pct(y, viewport.height)};` +
          `width:${pct(w, viewport.width)};height:${pct(h, viewport.height)};cursor:pointer;`;

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

  // Only pages near the viewport are drawn. Rendering all of them at 2x DPR
  // meant a 19-page plan held ~19 full-resolution bitmaps in memory at once —
  // on a phone that is hundreds of MB, which is what made scrolling stutter,
  // and every zoom tap re-rendered the whole document. One page ahead and one
  // behind is enough to scroll smoothly.
  // Pages to keep drawn either side of the current one. Two, not one: with a
  // window of one the next page was freed the moment it stopped being adjacent,
  // so scrolling forward showed a blank page that then had to redraw — the
  // "page goes white and loads again" behaviour.
  const RENDER_WINDOW = 2;
  // Pages are only freed once they are this far away, so a page that just left
  // the window is not discarded the instant you scroll back to it.
  const KEEP_WINDOW = 4;

  const renderVisible = useCallback(async () => {
    if (!pdfRef.current || !viewerRef.current) return;
    const containerW = viewerRef.current.clientWidth;
    const total = pdfRef.current.numPages;
    const center = Math.min(Math.max(currentPageRef.current, 1), total);

    // Free only what is well outside the window. Setting width/height to 0 is
    // what actually releases the backing bitmap; hiding the element does not.
    const keepFrom = Math.max(1, center - KEEP_WINDOW);
    const keepTo = Math.min(total, center + KEEP_WINDOW);
    for (let i = 1; i <= total; i++) {
      if (i >= keepFrom && i <= keepTo) continue;
      const c = canvasRefs.current[i - 1];
      if (c && c.width !== 0) {
        c.width = 0;
        c.height = 0;
        renderedRef.current.delete(i);
      }
    }

    // Draw the current page first, then outward.
    const order = [center];
    for (let d = 1; d <= RENDER_WINDOW; d++) {
      if (center + d <= total) order.push(center + d);
      if (center - d >= 1) order.push(center - d);
    }

    for (const i of order) {
      const key = `${i}:${scaleMultiplier}:${containerW}`;
      if (renderedRef.current.get(i) === key) continue;
      // Claim the page before awaiting, so an overlapping call triggered by
      // more scrolling doesn't start rendering the same page a second time.
      renderedRef.current.set(i, key);
      try {
        await renderPage(i, containerW, scaleMultiplier);
      } catch {
        renderedRef.current.delete(i);
      }
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
      // XFA is for interactive forms; this plan has none, and parsing for it
      // costs time on every open.
      enableXfa: false,
      // Render fonts directly onto canvas instead of CSS @font-face.
      // Fixes glyph width mismatches that cause garbled letter spacing.
      disableFontFace: true,
      useSystemFonts: false,
    });

    const pdf = await loadingTask.promise;
    pdfRef.current = pdf;

    // Measure page 1 so unrendered pages can reserve the right height. Assume
    // a uniform page size — true for this plan, and only affects placeholders.
    try {
      const first = await pdf.getPage(1);
      const vp = first.getViewport({ scale: 1 });
      if (vp.width > 0) setPageAspect(vp.height / vp.width);
    } catch { /* keep the A4 default */ }

    // A newly opened document has nothing drawn yet.
    renderedRef.current.clear();
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
      // Start the access probe and read the cache at the same time. The probe
      // used to be awaited first, so even with the file already on the device
      // nothing appeared until the server answered — which is why an "already
      // downloaded" plan still felt like it was loading every time.
      const probePromise = probeSplitAccess();
      const [cachedBuf, cachedVersion] = await Promise.all([
        getCachedPdf(userId),
        getCachedVersion(userId),
      ]);

      if (cachedBuf) {
        // Draw immediately from the local copy. It was only ever written after
        // an authenticated, entitled fetch, so showing it while the probe is
        // still in flight does not widen access — and the probe below still
        // pulls it straight back off screen if this session is not entitled.
        await openPdf(pdfjsLib, cachedBuf);

        void (async () => {
          const probe = await probePromise;
          if (probe.state === "denied") {
            // Revoked, expired, or a different account: hide it again and drop
            // every local copy so it cannot be read from this device.
            await clearOtherUsersCache("");
            pdfRef.current = null;
            setNumPages(0);
            setStatus("no-access");
            return;
          }
          if (probe.state === "offline") return; // keep showing the cached copy

          await clearOtherUsersCache(userId);
          if (cachedVersion === probe.version) return; // already current

          try {
            const res = await fetch("/api/split", { cache: "no-store" });
            if (!res.ok) return;
            const fresh = await res.arrayBuffer();
            if (fresh.byteLength === 0) return;
            await savePdfToCache(userId, fresh, probe.version);
            await openPdf(pdfjsLib, fresh);
          } catch { /* keep showing the cached copy */ }
        })();
        return;
      }

      // Nothing cached — the probe has to settle before anything can be shown.
      const probe = await probePromise;
      if (probe.state === "denied") {
        await clearOtherUsersCache("");
        setStatus("no-access");
        return;
      }
      if (probe.state === "offline") throw new Error("offline-no-cache");

      await clearOtherUsersCache(userId);

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
      const t = setTimeout(() => renderVisible(), 60);
      return () => clearTimeout(t);
    }
  }, [status, numPages, renderVisible]);

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
      resizeTimer.current = setTimeout(() => {
        // Width changed, so every drawn page is the wrong size now.
        renderedRef.current.clear();
        void renderVisible();
      }, 250);
    });
    ro.observe(viewerRef.current);
    return () => { ro.disconnect(); if (resizeTimer.current) clearTimeout(resizeTimer.current); };
  }, [status, renderVisible]);

  const handleZoom = (d: number) =>
    setScaleMultiplier((p) => Math.min(Math.max(+(p + d).toFixed(2), 0.7), 2.0));

  // Anything already drawn is now at the wrong size, so drop the record and let
  // renderVisible redraw the window. Only ~3 pages are affected, not all 19.
  useEffect(() => {
    renderedRef.current.clear();
  }, [scaleMultiplier]);

  // Track which page is on screen, and remember it per user so reopening the
  // plan returns to where the customer stopped instead of page 1 — the whole
  // point when you are working through a split set by set.
  const storageKey = userId ? `amar-split-page:${userId}` : "";

  const handleScroll = useCallback(() => {
    const el = viewerRef.current;
    if (!el) return;
    const mid = el.scrollTop + el.clientHeight / 2;
    let page = 1;
    // Measured against the wrappers: they keep their reserved height even while
    // the canvas inside is freed, so this stays correct for undrawn pages.
    for (let i = 0; i < pageRefs.current.length; i++) {
      const p = pageRefs.current[i];
      if (!p) continue;
      if (p.offsetTop <= mid) page = i + 1;
      else break;
    }
    if (page !== currentPageRef.current) {
      currentPageRef.current = page;
      setCurrentPage(page);
      if (storageKey) {
        try { localStorage.setItem(storageKey, String(page)); } catch { /* private mode */ }
      }
      // Draw immediately rather than after a debounce. The 120ms wait meant the
      // next page stayed blank until scrolling stopped, which read as the page
      // disappearing and reloading. renderVisible skips pages already drawn at
      // the current size, so calling it often is cheap.
      void renderVisible();
    }
  }, [storageKey, renderVisible]);

  // Jump back to the remembered page once the document is on screen.
  useEffect(() => {
    if (status !== "ready" || numPages === 0 || restoredRef.current || !storageKey) return;
    restoredRef.current = true;

    let saved = 1;
    try { saved = parseInt(localStorage.getItem(storageKey) || "1", 10) || 1; } catch { /* ignore */ }
    if (saved <= 1 || saved > numPages) return;

    // Wait a frame so the canvases have their final heights.
    const id = setTimeout(() => {
      const target = canvasRefs.current[saved - 1];
      if (target && viewerRef.current) {
        viewerRef.current.scrollTop = target.offsetTop - 12;
        currentPageRef.current = saved;
        setCurrentPage(saved);
      }
    }, 120);
    return () => clearTimeout(id);
  }, [status, numPages, storageKey]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[#0b0f17] flex items-center justify-between text-xs shrink-0 z-20 select-none">
        {/* Offline caching is deliberately silent — the customer shouldn't have
            to think about downloads, so no status badge is shown here. */}
        {/* Page position — the plan is long, and without this there is no way
            to tell where you are or that the last page was remembered. */}
        <div className="flex items-center gap-2">
          {status === "ready" && numPages > 0 && (
            <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums px-2 py-1 rounded-[var(--radius-sm)] bg-white/5 border border-white/10">
              {currentPage} / {numPages}
            </span>
          )}
        </div>
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
        onScroll={handleScroll}
        className="no-print-pdf flex-1 w-full overflow-y-auto bg-[#070a0f] flex flex-col items-center relative"
        // Pages are drawn to <canvas>, so there is no selectable text to copy
        // anyway; dragging the canvas out as an image is the one thing worth
        // preventing, and it costs the customer nothing.
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center w-full">
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
            <div
              key={i}
              id={`pdf-page-${i + 1}`}
              ref={(el) => { pageRefs.current[i] = el; }}
              // No card treatment: rounded corners, a border and a shadow on
              // every page turned a continuous document into 19 separate cards,
              // which is visually noisy and makes the plan harder to read than
              // it is on paper. Pages now butt directly against each other and
              // read as one scroll.
              className="relative bg-white w-full"
              // Reserve the page's height even before it is drawn, so the
              // scrollbar is correct from the start and scrolling never jumps
              // as pages render in and out of the window.
              style={{ aspectRatio: `1 / ${pageAspect}`, maxWidth: `${100 * scaleMultiplier}%` }}
            >
              <canvas ref={(el) => { canvasRefs.current[i] = el; }} style={{ display: "block", width: "100%" }} />
              <div ref={(el) => { overlayRefs.current[i] = el; }} className="absolute inset-0 z-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}