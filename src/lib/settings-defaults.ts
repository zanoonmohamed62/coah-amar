// Pure constants only — no server-only imports (db/redis) — so this file is
// safe to import from client components (see use-settings.ts).

export const SETTING_DEFAULTS = {
  instapay_handle: "01108610434",
  paypal_link: "https://www.paypal.me/amarel7ewety111",
  telda_handle: "@amar.fitness",
  // Public image URL (uploaded via /admin/settings, same public-upload path the
  // Site Editor uses) shown on the checkout page's Telda step — Telda is
  // scan-a-QR, not a text handle, so a handle string alone isn't enough.
  telda_qr_url: "",
  whatsapp_number: "+34610354255",
  whatsapp_message_en: "Hi Coach Amar, I am interested in joining your program.",
  whatsapp_message_ar: "مرحباً كوتش عمار، أود الاستفسار عن برامج التدريب والمتابعة.",
  support_email: "support@amarfitness.com",
  site_name: "THE AMAR",
  instagram_url: "https://instagram.com/amar.fitness",
  youtube_url: "https://youtube.com/@amar.el.7ewety?si=crwo5B3iAO_C1ufW",
  // The split ships as TWO PDFs, one per language, and each has its own slot.
  // Empty = fall back to the file on disk for that language
  // (private-assets/AMAR.X.SPLIT.ENGLISH.pdf / ...ARABIC.pdf).
  //
  // `active_split_media_id` (no suffix) is the original single-file setting and
  // is still honoured as the ENGLISH slot so an existing upload keeps working.
  // It used to be the only slot, which meant uploading one file replaced both
  // languages with it — an Arabic customer would open the Arabic tab and be
  // shown the English plan.
  active_split_media_id: "",
  active_split_media_id_en: "",
  active_split_media_id_ar: "",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

// Public, non-sensitive settings a client component may need directly.
export const PUBLIC_SETTING_KEYS: SettingKey[] = [
  "instapay_handle",
  "paypal_link",
  "telda_handle",
  "telda_qr_url",
  "whatsapp_number",
  "whatsapp_message_en",
  "whatsapp_message_ar",
  "support_email",
  "site_name",
  "instagram_url",
  "youtube_url",
];
