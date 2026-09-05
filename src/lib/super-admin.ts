// The one account allowed to manage other admins (add/remove/promote). Every
// other ADMIN can use the rest of /admin but never sees or reaches this page —
// there's exactly one owner of the admin roster, hardcoded rather than a DB
// flag since it never changes without a code deploy anyway.
const SUPER_ADMIN_EMAIL = "zanoon.bis@gmail.com";

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}
