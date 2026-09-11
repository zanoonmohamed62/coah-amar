"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

// Idle sign-out for the ADMIN panel only.
//
// It used to run in the customer portal too, on a 15-minute timer, and signing
// out cleared the device's copy of the plan — so a customer who left the app
// open between sets came back to a re-download. Customers are no longer timed
// out at all (see src/lib/auth.config.ts); this hook now guards the one session
// that genuinely needs guarding, the one that can confirm payments and read
// every customer's details.
//
// Kept in step with the server-side rule in auth.config.ts's `authorized`:
// one hour of inactivity. This is only the polite client-side half — closing the
// laptop and reopening it an hour later is caught by the server on the next
// request either way.
const TIMEOUT_MS = 60 * 60 * 1000;
const WARNING_MS = 59 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "touchstart", "scroll"];

interface UseSessionTimeoutOptions {
  onWarning?: () => void; // called 1 min before logout
  /** Defaults to true; pass false to leave a session alone entirely. */
  enabled?: boolean;
}

export function useSessionTimeout({ onWarning, enabled = true }: UseSessionTimeoutOptions = {}) {
  const { status } = useSession();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();

    warningRef.current = setTimeout(() => {
      onWarning?.();
    }, WARNING_MS);

    timeoutRef.current = setTimeout(() => {
      signOut({ callbackUrl: "/login?reason=timeout" });
    }, TIMEOUT_MS);
  }, [clearTimers, onWarning]);

  useEffect(() => {
    if (!enabled || status !== "authenticated") return;

    resetTimer();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [status, resetTimer, clearTimers, enabled]);
}
