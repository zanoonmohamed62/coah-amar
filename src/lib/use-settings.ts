"use client";

import { useEffect, useState } from "react";
import { SETTING_DEFAULTS, type SettingKey } from "@/lib/settings-defaults";

type SettingsMap = Record<string, string>;

let cache: SettingsMap | null = null;
let inFlight: Promise<SettingsMap> | null = null;

async function fetchSettings(): Promise<SettingsMap> {
  if (cache) return cache;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch("/api/settings/public");
      const data = await res.json();
      cache = data.settings || {};
      return cache!;
    } catch {
      inFlight = null;
      return {};
    }
  })();

  return inFlight;
}

/**
 * useSettings — returns a function `get(key)` that reads a live Setting value,
 * falling back to the built-in default until the fetch resolves (or on error).
 *
 * Usage:
 *   const get = useSettings();
 *   const waNumber = get("whatsapp_number");
 */
export function useSettings() {
  const [settings, setSettings] = useState<SettingsMap>(cache || {});

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  function get(key: SettingKey): string {
    return settings[key] || SETTING_DEFAULTS[key];
  }

  return get;
}
