import { db } from "@/lib/db";
import { fetchWithCache } from "@/lib/redis";
import { SETTING_DEFAULTS, PUBLIC_SETTING_KEYS, type SettingKey } from "@/lib/settings-defaults";

export { SETTING_DEFAULTS, PUBLIC_SETTING_KEYS, type SettingKey };

async function loadAllSettings(): Promise<Record<string, string>> {
  return fetchWithCache(
    "settings:all",
    async () => {
      const rows = await db.setting.findMany();
      const map: Record<string, string> = {};
      for (const row of rows) map[row.key] = row.value;
      return map;
    },
    300 // 5 minute cache — matches other public-facing cached reads in this app
  );
}

export async function getSetting(key: SettingKey): Promise<string> {
  const all = await loadAllSettings();
  return all[key] ?? SETTING_DEFAULTS[key];
}

export async function getSettings(keys: SettingKey[]): Promise<Record<string, string>> {
  const all = await loadAllSettings();
  const result: Record<string, string> = {};
  for (const key of keys) result[key] = all[key] ?? SETTING_DEFAULTS[key];
  return result;
}

export async function getPublicSettings(): Promise<Record<SettingKey, string>> {
  const all = await loadAllSettings();
  const result = {} as Record<SettingKey, string>;
  for (const key of PUBLIC_SETTING_KEYS) result[key] = all[key] ?? SETTING_DEFAULTS[key];
  return result;
}
