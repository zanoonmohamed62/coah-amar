// Pure constants only — no server-only imports (db/redis) — so this file is
// safe to import from client components (see use-settings.ts).

export const SETTING_DEFAULTS = {
  instapay_handle: "amar.fitness@instapay",
  paypal_link: "https://paypal.me/amarfitness",
  telda_handle: "@amar.fitness",
  whatsapp_number: "+34610354255",
  whatsapp_message_en: "Hi Coach Amar, I am interested in joining your program.",
  whatsapp_message_ar: "مرحباً كوتش عمار، أود الاستفسار عن برامج التدريب والمتابعة.",
  support_email: "support@amarfitness.com",
  site_name: "THE AMAR",
  instagram_url: "https://instagram.com/amar.fitness",
  youtube_url: "https://youtube.com/@amar.el.7ewety?si=crwo5B3iAO_C1ufW",
  // Empty string = fall back to the legacy static file at private-assets/AMARX-SPLIT.pdf.
  // Set by the admin "Training Plan File" uploader (see /admin/settings) to the id of a
  // MediaAsset row once a PDF has been uploaded through the UI.
  active_split_media_id: "",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

// Public, non-sensitive settings a client component may need directly.
export const PUBLIC_SETTING_KEYS: SettingKey[] = [
  "instapay_handle",
  "paypal_link",
  "telda_handle",
  "whatsapp_number",
  "whatsapp_message_en",
  "whatsapp_message_ar",
  "support_email",
  "site_name",
  "instagram_url",
  "youtube_url",
];
