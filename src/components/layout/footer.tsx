"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function Footer() {
  const { t, isArabic } = useLanguage();

  const footerLinks = [
    { href: "#plans", label: t.nav.plans },
    { href: "#coach", label: t.nav.coach },
    { href: "#results", label: t.nav.results },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-[var(--accent)] flex items-center justify-center rounded-sm bg-[var(--accent-glow)]">
                <span className="text-[var(--accent)] font-bold text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                  A
                </span>
              </div>
              <span
                className="font-bold tracking-wider uppercase text-sm"
                style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}
              >
                {t.nav.brand}
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">
              {t.footer.desc}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-[var(--text-muted)] mb-4">
              {t.footer.navigate}
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
              {t.footer.offers}
            </p>
            <ul className="space-y-3">
              <li>
                <Link href="#plans" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                  {t.footer.planOffer}
                </Link>
              </li>
              <li>
                <Link href="#plans" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                  {t.footer.coachingOffer}
                </Link>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.youtube.com/@AmarFitness"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                aria-label="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
              <a
                href="https://www.instagram.com/amar.el.7ewety/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a
                href="https://wa.me/34610354255"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {t.footer.tag}
          </p>
        </div>
      </div>
    </footer>
  );
}
