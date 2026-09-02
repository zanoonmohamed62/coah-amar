"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, LogIn, LayoutDashboard, User } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { EditableText } from "@/components/cms/EditableText";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggleLang, isArabic, t } = useLanguage();
  const get = useSiteContent();
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const accountHref = role === "ADMIN" ? "/admin" : "/app";
  const accountLabel = role === "ADMIN" ? (isArabic ? "لوحة التحكم" : "Admin") : (isArabic ? "حسابي" : "My Account");
  const AccountIcon = role === "ADMIN" ? LayoutDashboard : User;

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#07090e]/85 backdrop-blur-md border-b border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.6)] py-3.5"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-white/10">
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
                className="text-[var(--text-secondary)] hover:text-white transition-colors text-xs font-semibold tracking-wider uppercase"
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-blue-500/40 hover:bg-white/[0.08] text-xs font-medium text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer shadow-sm"
              title={lang === "en" ? "تبديل إلى اللغة العربية" : "Switch to English"}
            >
              <Globe size={13} className="text-blue-400" />
              <span>{t.nav.langSwitch}</span>
            </button>

            {status === "authenticated" ? (
              <Link
                href={accountHref}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-blue-500/40 hover:bg-white/[0.08] text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-all shadow-sm"
              >
                <AccountIcon size={13} className="text-blue-400" />
                <span>{accountLabel}</span>
              </Link>
            ) : status !== "loading" ? (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-blue-500/40 hover:bg-white/[0.08] text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-all shadow-sm"
              >
                <LogIn size={13} className="text-blue-400" />
                <span>{isArabic ? "تسجيل الدخول" : "Login"}</span>
              </Link>
            ) : null}

            <Link href="#plans" className="btn-primary text-xs py-2 px-5 rounded-xl font-bold tracking-wide relative z-10">
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

              {status === "authenticated" ? (
                <Link
                  href={accountHref}
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-[var(--border-accent)] glass text-sm font-semibold text-[var(--text-secondary)]"
                >
                  <AccountIcon size={16} />
                  <span>{accountLabel}</span>
                </Link>
              ) : status !== "loading" ? (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-[var(--border-accent)] glass text-sm font-semibold text-[var(--text-secondary)]"
                >
                  <LogIn size={16} />
                  <span>{isArabic ? "تسجيل الدخول" : "Login"}</span>
                </Link>
              ) : null}

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
