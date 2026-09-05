"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { useSettings } from "@/lib/use-settings";
import { EditableText } from "@/components/cms/EditableText";

export function Footer() {
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();
  const getSetting = useSettings();

  const footerLinks = [
    { href: "#plans", label: get("nav", "plans", t.nav.plans) },
    { href: "#coach", label: get("nav", "coach", t.nav.coach) },
    { href: "#results", label: get("nav", "results", t.nav.results) },
    { href: "#faq", label: get("nav", "faq", t.nav.faq) },
  ];

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon.svg" alt="Amar X Split" className="w-full h-full object-contain" />
              </div>
              <span
                className="font-bold tracking-wider uppercase text-sm"
                style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}
              >
                {get("nav", "brand", t.nav.brand)}
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs whitespace-pre-wrap">
              <EditableText multiline sectionId="footer" fieldId="desc" value={get("footer", "desc", t.footer.desc)} />
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)] mb-4">
              <EditableText sectionId="footer" fieldId="navigate" value={get("footer", "navigate", t.footer.navigate)} />
            </p>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Offers */}
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)] mb-4">
              <EditableText sectionId="footer" fieldId="offers" value={get("footer", "offers", t.footer.offers)} />
            </p>
            <ul className="space-y-3">
              <li>
                <Link href="#plans" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                  <EditableText sectionId="footer" fieldId="planOffer" value={get("footer", "planOffer", t.footer.planOffer)} />
                </Link>
              </li>
              <li>
                <Link href="#plans" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                  <EditableText sectionId="footer" fieldId="coachingOffer" value={get("footer", "coachingOffer", t.footer.coachingOffer)} />
                </Link>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href={getSetting("youtube_url")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                aria-label="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
              <a
                href={getSetting("instagram_url")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a
                href={`https://wa.me/${getSetting("whatsapp_number").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} <EditableText sectionId="footer" fieldId="rights" value={get("footer", "rights", t.footer.rights)} />
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            <EditableText sectionId="footer" fieldId="tag" value={get("footer", "tag", t.footer.tag)} />
          </p>
        </div>
      </div>
    </footer>
  );
}
