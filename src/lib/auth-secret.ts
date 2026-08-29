export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET (or NEXTAUTH_SECRET) must be set in production — refusing to start with a guessable default."
    );
  }

  return "dev-only-insecure-secret-do-not-use-in-production";
}
