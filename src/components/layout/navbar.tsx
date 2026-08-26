"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, LayoutDashboard, Users } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggleLang, isArabic, t } = useLanguage();

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
    { href: "#plans", label: t.nav.plans },
    { href: "#coach", label: t.nav.coach },
    { href: "#results", label: t.nav.results },
    { href: "#faq", label: t.nav.faq },
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
            <div className="w-10 h-10 rounded-sm overflow-hidden border border-[var(--accent)] shadow-md shadow-blue-500/20 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/app-logo.jpg" alt="Amar X Split App" className="w-full h-full object-cover" />
            </div>
            <span
              className="font-bold tracking-wider uppercase text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors hidden sm:inline"
              style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}
            >
              {t.nav.brand}
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
                {link.label}
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

            {/* Admin & Dashboard links */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 text-xs font-semibold transition-all"
            >
              <LayoutDashboard size={13} />
              Admin
            </Link>
            <Link
              href="/app"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 text-xs font-semibold transition-all"
            >
              <Users size={13} />
              Dashboard
            </Link>

            <Link href="#plans" className="btn-primary text-xs relative z-10">
              {t.nav.startNow}
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
                  {link.label}
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
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-purple-500/40 bg-purple-500/10 text-purple-400 text-sm font-semibold"
              >
                <LayoutDashboard size={15} />
                Admin Panel
              </Link>
              <Link
                href="/app"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-sm font-semibold"
              >
                <Users size={15} />
                Client Dashboard
              </Link>
              <Link
                href="#plans"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-center"
              >
                {t.nav.startNow}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
