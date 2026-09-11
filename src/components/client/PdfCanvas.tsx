"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, WifiOff, Lock, MessageCircle } from "lucide-react";
import { RealisticOfflineWifiIcon } from "@/components/client/PwaIcons";
import { useSettings } from "@/lib/use-settings";
import {
  getCachedPdf,
  getCachedVersion,
  probeSplitAccess,
  clearOtherUsersCache,
  savePdfToCache,
  getPageImages,
  savePageImage,
  prunePageImages,
  rememberSplitUser,
  getRememberedSplitUser,
  forgetOfflineSplit,
} from "@/lib/split-cache";
import type { SplitLang } from "@/lib/split-cache";

// ─────────────────────────────────────────────────────────────────────────────
// How the plan is shown
//
// The PDF is not drawn while you read. Each page is rasterised with pdf.js
// once, stored on the device as a JPEG (per user, per PDF version), and shown
// as a plain <img>. Scrolling is then ordinary image scrolling — the browser
// does it natively and smoothly, with nothing to redraw and nothing to wipe.
//
// Drawing pages live with pdf.js as they scrolled into view was what made the
// plan lag (each page costs hundreds of milliseconds on a phone, on the main
// thread) and flash (pages far from the screen were freed to save memory, so
// coming back to one meant a blank page until it redrew). With the images
// cached, reopening the plan — online or offline — shows every page at once.
//
// pdf.js is still used for three things: rendering a page the first time,
// reading the in-plan links, and drawing a sharper copy of the page on screen
// when the customer zooms in past what the stored image can show.
// ─────────────────────────────────────────────────────────────────────────────

// Deters leaks by making any copy traceable to the customer who viewed it.
// Sized relative to the page so it looks the same at any resolution.
function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  if (!text) return;
  const u = width / 600; // proportions tuned on a 600px-wide page
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#3b82f6";
  ctx.font = `bold ${Math.max(10, Math.round(13 * u))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const angle = -Math.PI / 6;
  const stepX = 240 * u;
  const stepY = 130 * u;

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

type PageLink = { left: number; top: number; width: number; height: number; url?: string; dest?: unknown };

// Pages either side of the current one that get their image attached. The
// rest keep their reserved box but no decoded bitmap, which bounds memory on a
// long plan; six pages ahead is far more than a scroll can outrun.
const IMG_WINDOW = 6;
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
// Upper bound for any single page bitmap (~20MB), so deep zoom can't exhaust a
// phone's memory. Past it the resolution is lowered instead.
const MAX_CANVAS_PIXELS = 5_000_000;
const HINT_KEY = "amar-split-zoom-hint";

// Stored-image width in device pixels: enough for the screen at fit-width,
// rounded to a bucket so small width changes reuse the same cached set.
function rasterWidthFor(cssWidth: number): number {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = Math.ceil((cssWidth * dpr) / 256) * 256;
  return Math.min(Math.max(w, 1024), 2048);
}

const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function drawPage(pdf: any, pageNum: number, width: number, label: string): Promise<HTMLCanvasElement | null> {
  const page = await pdf.getPage(pageNum);
  const base = page.getViewport({ scale: 1 });
  let scale = width / base.width;
  const area = base.width * scale * base.height * scale;
  if (area > MAX_CANVAS_PIXELS) scale *= Math.sqrt(MAX_CANVAS_PIXELS / area);
  // Bake the resolution into the viewport so pdf.js handles all scaling —
  // a separate ctx.setTransform garbles glyph spacing.
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, intent: "display" }).promise;
  drawWatermark(ctx, canvas.width, canvas.height, label);
  page.cleanup();
  return canvas;
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9));
}

interface Props {
  isArabic: boolean;
  lang: SplitLang;
}

export default function PdfCanvas({ isArabic, lang }: Props) {
  // ── Who is reading ────────────────────────────────────────────────────────
  // Offline, next-auth cannot reach the session endpoint and reports
  // "unauthenticated", which used to leave the viewer with no user to find the
  // cached plan by. It also briefly reports "loading" on every open, and the
  // viewer used to treat that as "no access" and flash the lock screen. So:
  // wait while loading; use the session when there is one; and when the session
  // can't be reached, fall back to the account last signed in on this device.
  // A server that answers "no session" (a real sign-out) clears that fallback
  // and the cached plan.
  const { data: session, status: sessionStatus } = useSession();
  const sessionUser = session?.user as { id?: string; name?: string; email?: string } | undefined;
  const [signedOut, setSignedOut] = useState(false);
  const authedId = sessionStatus === "authenticated" ? (sessionUser?.id ?? "") : "";
  const authedLabel = sessionUser?.email || sessionUser?.name || "";
  const remembered = sessionStatus === "unauthenticated" && !signedOut ? getRememberedSplitUser() : null;
  const userId = authedId || remembered?.id || "";
  const watermarkText = authedId ? authedLabel : (remembered?.label ?? "");
  const identityPending = sessionStatus === "loading";

  useEffect(() => {
    if (authedId) rememberSplitUser(authedId, authedLabel);
  }, [authedId, authedLabel]);

  useEffect(() => {
    if (sessionStatus !== "unauthenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) return; // server trouble — not evidence of a sign-out
        const data = await res.json().catch(() => undefined);
        if (cancelled) return;
        if (data === null || (data && typeof data === "object" && !("user" in data && data.user))) {
          await forgetOfflineSplit();
          if (!cancelled) setSignedOut(true);
        }
      } catch {
        /* offline: keep reading as the remembered account */
      }
    })();
    return () => { cancelled = true; };
  }, [sessionStatus]);

  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

  const viewerRef = useRef<HTMLDivElement>(null);
  // The element pinch-zoom transforms: the whole document column, so zooming
  // scales every page together the way a document viewer does.
  const contentRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hiResRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const urlsRef = useRef<(string | null)[]>([]);
  const jobRef = useRef(0);
  const rasterRef = useRef<{ version: string; width: number } | null>(null);
  const labelRef = useRef(watermarkText);
  useEffect(() => { labelRef.current = watermarkText; }, [watermarkText]);

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "no-access">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [numPages, setNumPages] = useState(0);
  // Height/width of the plan's pages (16:9 landscape); replaced with page 1's
  // measured ratio as soon as the document opens.
  const [pageAspect, setPageAspect] = useState(0.5625);
  const [pageUrls, setPageUrls] = useState<(string | null)[]>([]);
  const [links, setLinks] = useState<PageLink[][]>([]);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const currentPageRef = useRef(1);
  const restoredRef = useRef(false);

  const storageKey = userId ? `amar-split-page:${userId}:${lang}` : "";

  // ── Page images ───────────────────────────────────────────────────────────
  const publishUrls = useCallback((updates: { index: number; blob: Blob }[]) => {
    const next = urlsRef.current.slice();
    const stale: string[] = [];
    for (const { index, blob } of updates) {
      const old = next[index];
      next[index] = URL.createObjectURL(blob);
      if (old) stale.push(old);
    }
    urlsRef.current = next;
    setPageUrls(next);
    // Replaced images are released only after their successors have painted,
    // so a page being swapped for a newer render never shows empty.
    if (stale.length) setTimeout(() => stale.forEach((u) => URL.revokeObjectURL(u)), 3000);
  }, []);

  const releaseUrls = useCallback(() => {
    urlsRef.current.forEach((u) => u && URL.revokeObjectURL(u));
    urlsRef.current = [];
    setPageUrls([]);
  }, []);

  // Show every page already stored on this device in one go, then render the
  // missing ones — always the one nearest the page on screen next, so the page
  // you are looking at is never waiting behind pages you are not.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildPages = useCallback(async (pdf: any, version: string) => {
    const el = viewerRef.current;
    if (!userId || !el) return;
    const job = ++jobRef.current;
    const width = rasterWidthFor(el.clientWidth || window.innerWidth);
    rasterRef.current = { version, width };
    const total: number = pdf.numPages;

    if (urlsRef.current.length > total) {
      urlsRef.current.slice(total).forEach((u) => u && URL.revokeObjectURL(u));
    }
    urlsRef.current = Array.from({ length: total }, (_, i) => urlsRef.current[i] ?? null);

    const cached = await getPageImages(userId, version, width, total);
    if (job !== jobRef.current) return;
    const hits: { index: number; blob: Blob }[] = [];
    cached.forEach((blob, index) => { if (blob) hits.push({ index, blob }); });
    if (hits.length) publishUrls(hits);

    const done = cached.map((b) => !!b);
    for (;;) {
      if (job !== jobRef.current) return;
      const c = Math.min(Math.max(currentPageRef.current, 1), total) - 1;
      let i = -1;
      for (let d = 0; d < total && i < 0; d++) {
        if (c + d < total && !done[c + d]) i = c + d;
        else if (c - d >= 0 && !done[c - d]) i = c - d;
      }
      if (i < 0) break;
      done[i] = true;
      try {
        const canvas = await drawPage(pdf, i + 1, width, labelRef.current);
        if (job !== jobRef.current) return;
        if (canvas) {
          const blob = await canvasToJpeg(canvas);
          canvas.width = 0;
          canvas.height = 0;
          if (blob && job === jobRef.current) {
            publishUrls([{ index: i, blob }]);
            void savePageImage(userId, version, width, i + 1, blob);
          }
        }
      } catch {
        /* a page that fails to render keeps its placeholder */
      }
      // Let scrolling and taps through between pages.
      await nextTask();
    }
    if (job === jobRef.current) void prunePageImages(userId, version, width);
  }, [userId, publishUrls]);

  // In-plan links (the language picker, jumps between sections), read once per
  // document and laid over the images as percentages of the page.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadLinks = useCallback(async (pdf: any) => {
    const all: PageLink[][] = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const list: PageLink[] = [];
      try {
        const page = await pdf.getPage(n);
        const vp = page.getViewport({ scale: 1 });
        const annotations = await page.getAnnotations({ intent: "display" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const a of annotations as any[]) {
          if (a.subtype !== "Link" || !a.rect || (!a.url && !a.dest)) continue;
          const r = vp.convertToViewportRectangle(a.rect);
          list.push({
            left: (Math.min(r[0], r[2]) / vp.width) * 100,
            top: (Math.min(r[1], r[3]) / vp.height) * 100,
            width: (Math.abs(r[2] - r[0]) / vp.width) * 100,
            height: (Math.abs(r[3] - r[1]) / vp.height) * 100,
            url: a.url,
            dest: a.dest,
          });
        }
      } catch {
        /* no links on this page */
      }
      all.push(list);
    }
    if (pdfRef.current === pdf) setLinks(all);
  }, []);

  const goToDest = useCallback(async (dest: unknown) => {
    const pdf = pdfRef.current;
    const el = viewerRef.current;
    if (!pdf || !el) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let d: any = dest;
      if (typeof d === "string") d = await pdf.getDestination(d);
      if (!d) return;
      const idx = await pdf.getPageIndex(d[0]);
      const target = pageRefs.current[idx];
      if (target) el.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    } catch {
      /* ignore */
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openPdf = useCallback(async (pdfjsLib: any, buf: ArrayBuffer, version: string) => {
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buf.slice(0)),
      cMapUrl: "/pdfjs/cmaps/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "/pdfjs/standard_fonts/standard_fonts/",
      // XFA is for interactive forms; this plan has none.
      enableXfa: false,
      // Render fonts directly onto canvas instead of CSS @font-face.
      // Fixes glyph width mismatches that cause garbled letter spacing.
      disableFontFace: true,
      useSystemFonts: false,
    }).promise;

    const previous = pdfRef.current;
    pdfRef.current = pdf;
    try {
      const first = await pdf.getPage(1);
      const vp = first.getViewport({ scale: 1 });
      if (vp.width > 0) setPageAspect(vp.height / vp.width);
    } catch {
      /* keep the default */
    }
    setNumPages(pdf.numPages);
    setStatus("ready");
    void buildPages(pdf, version);
    void loadLinks(pdf);
    if (previous && previous !== pdf) {
      try { previous.destroy(); } catch { /* ignore */ }
    }
  }, [buildPages, loadLinks]);

  const hideEverything = useCallback(() => {
    jobRef.current++;
    try { pdfRef.current?.destroy(); } catch { /* ignore */ }
    pdfRef.current = null;
    releaseUrls();
    setLinks([]);
    setNumPages(0);
    setStatus("no-access");
  }, [releaseUrls]);

  // ── Loading the document ──────────────────────────────────────────────────
  const loadDocument = useCallback(async () => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

      if (!userId) {
        setStatus("no-access");
        return;
      }

      // Start from the page the customer left off on, so that page is the
      // first one rendered.
      try {
        const saved = parseInt(localStorage.getItem(`amar-split-page:${userId}:${lang}`) || "1", 10);
        if (saved > 0) currentPageRef.current = saved;
      } catch { /* ignore */ }

      // Probe access and read the cache at the same time, so a plan already on
      // the device appears without waiting on the network.
      const probePromise = probeSplitAccess(lang);
      const [cachedBuf, cachedVersion] = await Promise.all([
        getCachedPdf(userId, lang),
        getCachedVersion(userId, lang),
      ]);

      if (cachedBuf) {
        // The local copy was only ever written after an authenticated, entitled
        // fetch, so showing it while the probe is in flight does not widen
        // access — and the probe pulls it straight back if this session is not
        // entitled.
        await openPdf(pdfjsLib, cachedBuf, cachedVersion ?? "cached");

        void (async () => {
          const probe = await probePromise;
          if (probe.state === "denied") {
            await clearOtherUsersCache("");
            hideEverything();
            return;
          }
          if (probe.state === "offline") return; // keep showing the cached copy

          await clearOtherUsersCache(userId);
          if (cachedVersion === probe.version) return; // already current

          try {
            const res = await fetch(`/api/split?lang=${lang}`, { cache: "no-store", headers: { "x-amar-viewer": "1" } });
            if (!res.ok) return;
            const fresh = await res.arrayBuffer();
            if (fresh.byteLength === 0) return;
            await savePdfToCache(userId, fresh, probe.version, lang);
            // The pages on screen stay until the new version's images replace
            // them one by one.
            await openPdf(pdfjsLib, fresh, probe.version);
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

      const res = await fetch(`/api/split?lang=${lang}`, { cache: "no-store", headers: { "x-amar-viewer": "1" } });
      if (res.status === 403 || res.status === 401) {
        setStatus("no-access");
        return;
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const buf = await res.arrayBuffer();
      await savePdfToCache(userId, buf, probe.version, lang);
      await openPdf(pdfjsLib, buf, probe.version);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PdfCanvas]", msg);
      setErrMsg(msg);
      setStatus("error");
    }
  }, [openPdf, userId, hideEverything, lang]);

  useEffect(() => {
    if (identityPending) return;
    void loadDocument();
  }, [loadDocument, identityPending]);

  const retry = () => {
    setStatus("loading");
    setErrMsg("");
    void loadDocument();
  };

  // Release everything on the way out.
  useEffect(() => {
    const urls = urlsRef;
    const job = jobRef;
    const pdf = pdfRef;
    return () => {
      job.current++;
      urls.current.forEach((u) => u && URL.revokeObjectURL(u));
      try { pdf.current?.destroy(); } catch { /* ignore */ }
    };
  }, []);

  // A much wider or narrower viewer (rotating the phone, entering fullscreen
  // on desktop) re-renders the images at the new size. The current ones stay
  // up until each is replaced.
  useEffect(() => {
    const el = viewerRef.current;
    if (!el || status !== "ready") return;
    let timer: NodeJS.Timeout | null = null;
    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const raster = rasterRef.current;
        const pdf = pdfRef.current;
        if (!raster || !pdf) return;
        if (rasterWidthFor(el.clientWidth) !== raster.width) void buildPages(pdf, raster.version);
      }, 500);
    });
    ro.observe(el);
    return () => { ro.disconnect(); if (timer) clearTimeout(timer); };
  }, [status, buildPages]);

  // ── Sharp pages when zoomed ───────────────────────────────────────────────
  // The stored images are sized for fit-width. Zoomed in further, the page on
  // screen (and the next) is drawn again at the zoomed resolution onto a canvas
  // laid over its image. The image stays underneath, so at worst the page is
  // slightly soft for a moment — never blank.
  const hiResKeys = useRef<Map<number, number>>(new Map());
  const hiResJob = useRef(0);
  useEffect(() => {
    if (status !== "ready") return;
    const job = ++hiResJob.current;

    const release = (keep: Set<number>) => {
      hiResRefs.current.forEach((c, i) => {
        if (!c || keep.has(i)) return;
        if (c.width !== 0) { c.width = 0; c.height = 0; }
        c.style.display = "none";
        hiResKeys.current.delete(i);
      });
    };

    const timer = setTimeout(async () => {
      const pdf = pdfRef.current;
      const el = viewerRef.current;
      const raster = rasterRef.current;
      if (!pdf || !el || !raster) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const need = Math.round(el.clientWidth * scaleMultiplier * dpr);
      if (scaleMultiplier <= 1.01 || need <= raster.width * 1.15) {
        release(new Set());
        return;
      }
      const targets = [currentPage - 1, currentPage].filter((i) => i >= 0 && i < numPages);
      release(new Set(targets));
      for (const i of targets) {
        if (job !== hiResJob.current) return;
        if (hiResKeys.current.get(i) === need) continue;
        const target = hiResRefs.current[i];
        if (!target) continue;
        try {
          const off = await drawPage(pdf, i + 1, need, labelRef.current);
          if (!off) continue;
          if (job !== hiResJob.current) { off.width = 0; return; }
          target.width = off.width;
          target.height = off.height;
          target.getContext("2d")?.drawImage(off, 0, 0);
          off.width = 0;
          off.height = 0;
          target.style.display = "block";
          hiResKeys.current.set(i, need);
        } catch {
          /* the stored image stays visible */
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [status, scaleMultiplier, currentPage, numPages]);

  // ── Page counter ──────────────────────────────────────────────────────────
  // Shown after any scroll or zoom, then faded, so it never sits over the plan
  // while the customer reads.
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeTimer = useRef<NodeJS.Timeout | null>(null);
  const flashChrome = useCallback(() => {
    setChromeVisible(true);
    if (chromeTimer.current) clearTimeout(chromeTimer.current);
    chromeTimer.current = setTimeout(() => setChromeVisible(false), 1600);
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    const t = setTimeout(() => setChromeVisible(false), 1600);
    return () => clearTimeout(t);
  }, [status]);

  // ── Zoom by hand ──────────────────────────────────────────────────────────
  // Pinch with two fingers, double-tap to zoom in / back out, drag to move
  // around a zoomed page — like Google Drive's viewer. While the fingers are
  // down the column is scaled with a CSS transform (free, on the GPU); when
  // they lift the zoom is committed: the column is laid out at the new width
  // and the scroll position set in the same frame so the point under the
  // fingers stays put.
  const scaleRef = useRef(1);
  const pendingScrollRef = useRef<{ left: number; top: number } | null>(null);

  const applyZoom = useCallback((next: number, cx: number, cy: number, vx: number, vy: number) => {
    const prev = scaleRef.current;
    const clamped = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    if (Math.abs(clamped - prev) < 0.001) {
      if (contentRef.current) contentRef.current.style.transform = "";
      return;
    }
    const r = clamped / prev;
    scaleRef.current = clamped;
    pendingScrollRef.current = { left: cx * r - vx, top: cy * r - vy };
    setScaleMultiplier(clamped);
    flashChrome();
  }, [flashChrome]);

  useLayoutEffect(() => {
    const el = viewerRef.current;
    if (contentRef.current) contentRef.current.style.transform = "";
    const pending = pendingScrollRef.current;
    if (el && pending) {
      // Clamp so zoomed content can't escape the viewport (fixes right-shift bug)
      const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollLeft = Math.min(Math.max(0, pending.left), maxLeft);
      el.scrollTop = Math.min(Math.max(0, pending.top), maxTop);
    }
    pendingScrollRef.current = null;
  }, [scaleMultiplier]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || status !== "ready") return;

    let pinch: {
      startDist: number; startScale: number;
      originX: number; originY: number; startMidX: number; startMidY: number;
      ratio: number; midX: number; midY: number;
    } | null = null;
    let tapStart: { x: number; y: number; moved: boolean } | null = null;
    let lastTap: { t: number; x: number; y: number } | null = null;

    const local = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        tapStart = null;
        const [a, b] = [e.touches[0], e.touches[1]];
        const m = local((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
        pinch = {
          startDist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1,
          startScale: scaleRef.current,
          originX: el.scrollLeft + m.x, originY: el.scrollTop + m.y,
          startMidX: m.x, startMidY: m.y, ratio: 1, midX: m.x, midY: m.y,
        };
        if (contentRef.current) {
          contentRef.current.style.transformOrigin = `${pinch.originX}px ${pinch.originY}px`;
        }
      } else if (e.touches.length === 1) {
        const p = local(e.touches[0].clientX, e.touches[0].clientY);
        tapStart = { x: p.x, y: p.y, moved: false };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (pinch && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const target = Math.min(Math.max(pinch.startScale * (dist / pinch.startDist), MIN_SCALE), MAX_SCALE);
        pinch.ratio = target / pinch.startScale;
        const m = local((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
        pinch.midX = m.x;
        pinch.midY = m.y;
        if (contentRef.current) {
          contentRef.current.style.transform =
            `translate(${m.x - pinch.startMidX}px, ${m.y - pinch.startMidY}px) scale(${pinch.ratio})`;
        }
      } else if (tapStart && e.touches.length === 1) {
        const p = local(e.touches[0].clientX, e.touches[0].clientY);
        if (Math.hypot(p.x - tapStart.x, p.y - tapStart.y) > 10) tapStart.moved = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (pinch && e.touches.length < 2) {
        const g = pinch;
        pinch = null;
        lastTap = null;
        applyZoom(g.startScale * g.ratio, g.originX, g.originY, g.midX, g.midY);
        return;
      }
      if (tapStart && !tapStart.moved && e.touches.length === 0) {
        const now = Date.now();
        const { x, y } = tapStart;
        if (lastTap && now - lastTap.t < 300 && Math.hypot(x - lastTap.x, y - lastTap.y) < 30) {
          e.preventDefault();
          lastTap = null;
          const next = scaleRef.current > 1.05 ? 1 : DOUBLE_TAP_SCALE;
          applyZoom(next, el.scrollLeft + x, el.scrollTop + y, x, y);
        } else {
          lastTap = { t: now, x, y };
        }
      }
      tapStart = null;
    };

    // iOS Safari fires its own gesture events for a pinch; stop it zooming the
    // whole app on top of ours.
    const stopNative = (e: Event) => e.preventDefault();

    // Desktop: trackpad pinch and Ctrl+wheel arrive as wheel events with
    // ctrlKey set. Scale live with the transform, commit once the wheel rests.
    let wheel: { originX: number; originY: number; startMidX: number; startMidY: number; ratio: number } | null = null;
    let wheelTimer: NodeJS.Timeout | null = null;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      if (!wheel) {
        const m = local(e.clientX, e.clientY);
        wheel = { originX: el.scrollLeft + m.x, originY: el.scrollTop + m.y, startMidX: m.x, startMidY: m.y, ratio: 1 };
        if (contentRef.current) {
          contentRef.current.style.transformOrigin = `${wheel.originX}px ${wheel.originY}px`;
        }
      }
      const target = Math.min(Math.max(scaleRef.current * wheel.ratio * Math.exp(-e.deltaY * 0.01), MIN_SCALE), MAX_SCALE);
      wheel.ratio = target / scaleRef.current;
      if (contentRef.current) contentRef.current.style.transform = `scale(${wheel.ratio})`;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        const g = wheel;
        wheel = null;
        if (g) applyZoom(scaleRef.current * g.ratio, g.originX, g.originY, g.startMidX, g.startMidY);
      }, 180);
    };

    const onDblClick = (e: MouseEvent) => {
      const m = local(e.clientX, e.clientY);
      const next = scaleRef.current > 1.05 ? 1 : DOUBLE_TAP_SCALE;
      applyZoom(next, el.scrollLeft + m.x, el.scrollTop + m.y, m.x, m.y);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchcancel", onTouchEnd, { passive: false });
    el.addEventListener("gesturestart", stopNative);
    el.addEventListener("gesturechange", stopNative);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("dblclick", onDblClick);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("gesturestart", stopNative);
      el.removeEventListener("gesturechange", stopNative);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("dblclick", onDblClick);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [status, applyZoom]);

  // First open only: explain zoom, since there is no button to discover it.
  const [zoomHint, setZoomHint] = useState(() => {
    try { return localStorage.getItem(HINT_KEY) !== "1"; } catch { return false; }
  });
  useEffect(() => {
    if (status !== "ready" || !zoomHint) return;
    const t = setTimeout(() => {
      setZoomHint(false);
      try { localStorage.setItem(HINT_KEY, "1"); } catch { /* ignore */ }
    }, 4500);
    return () => clearTimeout(t);
  }, [status, zoomHint]);

  // ── Position ──────────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = viewerRef.current;
    if (!el) return;
    flashChrome();
    const mid = el.scrollTop + el.clientHeight / 2;
    let page = 1;
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
    }
  }, [storageKey, flashChrome]);

  // Return to the remembered page once the pages are laid out.
  useEffect(() => {
    if (status !== "ready" || numPages === 0 || restoredRef.current) return;
    restoredRef.current = true;
    const saved = currentPageRef.current;
    if (saved <= 1 || saved > numPages) return;
    const id = requestAnimationFrame(() => {
      const target = pageRefs.current[saved - 1];
      if (target && viewerRef.current) {
        viewerRef.current.scrollTop = target.offsetTop;
        setCurrentPage(saved);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [status, numPages]);

  const pageLabel = (n: number) => (isArabic ? `صفحة ${n}` : `Page ${n}`);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative">
      {status === "ready" && numPages > 0 && (
        <div
          className={`pointer-events-none absolute top-3 inset-x-0 z-20 flex justify-center transition-opacity duration-300 ${
            chromeVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-xs font-mono tabular-nums text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {currentPage} / {numPages}
            {scaleMultiplier > 1.01 && <span className="text-white/60"> · {Math.round(scaleMultiplier * 100)}%</span>}
          </span>
        </div>
      )}

      {zoomHint && status === "ready" && (
        <div className="pointer-events-none absolute bottom-6 inset-x-0 z-20 flex justify-center px-6">
          <span className="text-xs font-semibold text-white bg-black/75 backdrop-blur-sm px-4 py-2.5 rounded-full text-center">
            {isArabic ? "كبّر بإصبعين، أو اضغط مرتين على أي جزء" : "Pinch with two fingers, or double-tap to zoom"}
          </span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print-pdf { display: none !important; } }` }} />

      <div
        ref={viewerRef}
        onScroll={handleScroll}
        className="no-print-pdf flex-1 min-h-0 w-full overflow-auto overscroll-contain bg-[#070a0f]"
        // touch-action hands pinch and double-tap to the code above instead of
        // the browser zooming the whole app.
        style={{ touchAction: "pan-x pan-y", WebkitTouchCallout: "none" }}
        // No "Save image" / drag-out. A browser cannot stop a screenshot — the
        // watermark is what makes a leaked copy traceable.
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* The document column; its width is the zoom. `relative` makes it the
            pages' offsetParent, so their offsetTop is their document position. */}
        <div ref={contentRef} className="relative" style={{ width: `${scaleMultiplier * 100}%` }}>
          {status === "ready" && Array.from({ length: numPages }, (_, i) => {
            const url = Math.abs(i + 1 - currentPage) <= IMG_WINDOW ? pageUrls[i] : null;
            return (
              <div
                key={i}
                ref={(el) => { pageRefs.current[i] = el; }}
                className="relative w-full bg-[#141821]"
                style={{ aspectRatio: `1 / ${pageAspect}` }}
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={pageLabel(i + 1)}
                    draggable={false}
                    decoding="async"
                    className="absolute inset-0 w-full h-full select-none pointer-events-none"
                  />
                ) : !pageUrls[i] ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={22} className="animate-spin text-white/25" />
                  </div>
                ) : null}
                {/* Sharper copy while zoomed; shown only once fully drawn. */}
                <canvas
                  ref={(el) => { hiResRefs.current[i] = el; }}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ display: "none" }}
                />
                {(links[i] ?? []).map((l, k) => {
                  const box = { left: `${l.left}%`, top: `${l.top}%`, width: `${l.width}%`, height: `${l.height}%` };
                  return l.url ? (
                    <a key={k} href={l.url} target="_blank" rel="noopener noreferrer" className="absolute" style={box} aria-label={l.url} />
                  ) : (
                    <button key={k} type="button" onClick={() => void goToDest(l.dest)} className="absolute" style={box} aria-label={pageLabel(i + 1)} />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

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
            <Link
              href="/#split"
              className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-black rounded-[var(--radius-lg)] flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              {isArabic ? "اشتري الجدول" : "Buy the Split"}
            </Link>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#070a0f] z-10 px-6 text-center">
          {/* iOS Squircle Glass Frame with Ambient Red Backlight Glow */}
          <div className="relative">
            <div className="absolute -inset-2 bg-red-600/20 rounded-[24px] blur-md pointer-events-none" />
            <div className="relative w-16 h-16 rounded-[20px] bg-gradient-to-b from-red-950/40 via-[#150a0f] to-[#0a0507] border border-red-500/30 flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <RealisticOfflineWifiIcon className="w-9 h-9" />
            </div>
          </div>
          {errMsg === "offline-no-cache" ? (
            <>
              <p className="text-sm font-bold text-white tracking-tight">
                {isArabic ? "مفيش نت، والجدول لسه مش محفوظ على جهازك" : "You're offline and the plan isn't saved on this device yet"}
              </p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {isArabic
                  ? "افتح الجدول مرة واحدة وإنت متصل بالنت، وبعدها هيشتغل من غير نت."
                  : "Open it once while online and it will work offline from then on."}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-white tracking-tight">
                {isArabic ? "تعذر تحميل الجدول" : "Failed to load"}
              </p>
              {errMsg && (
                <p className="text-[11px] text-slate-500 font-mono max-w-xs break-words">{errMsg}</p>
              )}
            </>
          )}
          <button
            onClick={retry}
            className="relative group h-10 px-6 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-xs rounded-[16px] transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 border border-blue-400/30 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <span>{isArabic ? "إعادة المحاولة" : "Retry"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
