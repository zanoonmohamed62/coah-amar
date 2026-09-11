"use client";

import { useEffect } from "react";

// Tells the server this browser is on the site right now, so /admin can show a
// real "visitors online" number.
//
// One POST every 60 seconds, and only while the tab is actually visible — a
// tab left open in the background all day would otherwise be counted as a
// person standing in the shop. The id is random, generated in the browser, kept
// in sessionStorage, and means nothing outside the ~2-minute presence window.
//
// Deliberately a beacon rather than a held-open connection: ten thousand
// simultaneous visitors is ten thousand sockets against one Node process, while
// this is one small write per visitor per minute — about 170 requests a second
// even with ten thousand people on the site at the same moment.

const ID_KEY = "amar-visitor-id";
const INTERVAL_MS = 60_000;

function visitorId(): string {
  try {
    const existing = sessionStorage.getItem(ID_KEY);
    if (existing) return existing;
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    const id = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 16);
    sessionStorage.setItem(ID_KEY, id);
    return id;
  } catch {
    // Private mode with storage blocked: still count the visit, just without a
    // stable id across reloads.
    return Math.random().toString(36).slice(2, 14);
  }
}

export function VisitorBeacon() {
  useEffect(() => {
    const id = visitorId();
    let timer: ReturnType<typeof setInterval> | null = null;

    const ping = () => {
      if (document.visibilityState !== "visible") return;
      // keepalive lets the last ping survive the page being closed.
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        keepalive: true,
      }).catch(() => { /* offline or blocked — the count simply omits this tab */ });
    };

    const start = () => {
      if (timer) return;
      ping();
      timer = setInterval(ping, INTERVAL_MS);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
