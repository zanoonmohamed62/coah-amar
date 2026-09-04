"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_MS = 14 * 60 * 1000; // show warning at 14 minutes
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "touchstart", "scroll"];

interface UseSessionTimeoutOptions {
  onWarning?: () => void; // called 1 min before logout
}

export function useSessionTimeout({ onWarning }: UseSessionTimeoutOptions = {}) {
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
    if (status !== "authenticated") return;

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
  }, [status, resetTimer, clearTimers]);
}
