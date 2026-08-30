"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { EditableText } from "@/components/cms/EditableText";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggleLang, isArabic, t } = useLanguage();
  const get = useSiteContent();

  useEffect(() => {
    let prevScrolled = false;
    const handleScroll = () => {
      const isScrolled = window.scrollY > 40;
      if (isScrolled !== prevScrolled) {
        prevScrolled = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#plans", fieldId: "plans", label: get("nav", "plans", t.nav.plans) },
    { href: "#coach", fieldId: "coach", label: get("nav", "coach", t.nav.coach) },
    { href: "#results", fieldId: "results", label: get("nav", "results", t.nav.results) },
    { href: "#faq", fieldId: "faq", label: get("nav", "faq", t.nav.faq) },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass border-b border-[var(--border)] py-3"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon.svg" alt="Amar X Split" className="w-full h-full object-contain" />
            </div>
            <span
              className="font-bold tracking-wider uppercase text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors hidden sm:inline"
              style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}
            >
              <EditableText sectionId="nav" fieldId="brand" value={get("nav", "brand", t.nav.brand)} />
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-xs font-semibold tracking-wider uppercase"
              >
                <EditableText sectionId="nav" fieldId={link.fieldId} value={link.label} />
              </Link>
            ))}
          </div>

          {/* Actions: Lang Switcher & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switch Button */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[var(--border)] glass hover:border-[var(--border-accent)] hover:bg-[var(--accent-glow)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer"
              title={lang === "en" ? "تبديل إلى اللغة العربية" : "Switch to English"}
            >
              <Globe size={13} className="text-[var(--accent)]" />
              <span>{t.nav.langSwitch}</span>
            </button>

            <Link href="#plans" className="btn-primary text-xs relative z-10">
              <EditableText sectionId="nav" fieldId="startNow" value={get("nav", "startNow", t.nav.startNow)} />
            </Link>
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-[var(--border)] glass text-xs font-medium text-[var(--text-secondary)]"
            >
              <Globe size={12} className="text-[var(--accent)]" />
              <span>{lang === "en" ? "عربي" : "EN"}</span>
            </button>

            <button
              className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: isArabic ? "-100%" : "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isArabic ? "-100%" : "100%" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-40 glass flex flex-col items-center justify-center gap-8 md:hidden px-6"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-bold tracking-wide uppercase text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  <EditableText sectionId="nav" fieldId={link.fieldId} value={link.label} />
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.08 }}
              className="flex flex-col items-center gap-4 w-full max-w-xs mt-4"
            >
              <button
                onClick={() => {
                  toggleLang();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-[var(--border-accent)] glass text-sm font-semibold text-[var(--accent)]"
              >
                <Globe size={16} />
                <span>{t.nav.langSwitch}</span>
              </button>

              <Link
                href="#plans"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-center"
              >
                <EditableText sectionId="nav" fieldId="startNow" value={get("nav", "startNow", t.nav.startNow)} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
