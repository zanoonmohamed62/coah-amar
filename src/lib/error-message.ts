/**
 * Coerce anything an API returned in an `error` field into a string safe to
 * render.
 *
 * React throws "Objects are not valid as a React child" if a non-string ends up
 * in JSX, which unmounts the whole tree — the customer sees a blank
 * "this page couldn't load" screen instead of the actual problem. A validation
 * endpoint returning a structured error object was doing exactly that on
 * checkout, so treat every API error as untrusted shape and flatten it here.
 */
export function toErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value;

  if (value && typeof value === "object") {
    // Zod's flatten() shape: { formErrors: string[], fieldErrors: Record<string, string[]> }
    const obj = value as {
      formErrors?: unknown;
      fieldErrors?: Record<string, unknown>;
      message?: unknown;
    };

    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;

    if (Array.isArray(obj.formErrors)) {
      const first = obj.formErrors.find((m) => typeof m === "string" && m.trim());
      if (typeof first === "string") return first;
    }

    if (obj.fieldErrors && typeof obj.fieldErrors === "object") {
      for (const messages of Object.values(obj.fieldErrors)) {
        if (Array.isArray(messages)) {
          const first = messages.find((m) => typeof m === "string" && m.trim());
          if (typeof first === "string") return first;
        }
      }
    }
  }

  return fallback;
}
