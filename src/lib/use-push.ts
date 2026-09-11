"use client";

import { useCallback, useEffect, useState } from "react";

// Browser side of Web Push.
//
// Everything degrades quietly: an unsupported browser, a deployment with no
// VAPID keys, or a customer who declines all end in the same place — `supported`
// or `enabled` false, and no broken button on screen.
//
// iOS note: Safari only allows push for a site added to the home screen, and
// only from a real user gesture. So this never asks on load; it asks when the
// person presses the button.

export type PushState = {
  supported: boolean;
  /** The server has VAPID keys — without them nothing can be sent. */
  configured: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  busy: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
};

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function detectSupport(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function usePush(lang: "ar" | "en" = "ar"): PushState {
  // Read once, at first render. Safe against a hydration mismatch because
  // nothing renders on `supported` alone — every caller also requires
  // `configured`, which starts false on server and client alike.
  const [supported] = useState(detectSupport);
  const [configured, setConfigured] = useState(false);
  const [vapidKey, setVapidKey] = useState("");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() =>
    detectSupport() ? Notification.permission : "unsupported"
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/push/vapid");
        const data = await res.json();
        if (cancelled) return;
        setVapidKey(data.key || "");
        setConfigured(Boolean(data.enabled));
      } catch {
        /* offline — leave push switched off for this load */
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!cancelled) setSubscribed(Boolean(existing));
      } catch {
        /* no worker yet */
      }
    })();

    return () => { cancelled = true; };
  }, [supported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported || !vapidKey) return false;
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return false;

      const reg = await navigator.serviceWorker.ready;
      // Reuse an existing subscription rather than creating a second one for
      // the same device — the endpoint is the identity, and a duplicate would
      // just mean two copies of every notification.
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sub.toJSON(), lang }),
      });
      if (!res.ok) return false;
      setSubscribed(true);
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, [supported, vapidKey, lang]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, [supported]);

  return { supported, configured, permission, subscribed, busy, subscribe, unsubscribe };
}
