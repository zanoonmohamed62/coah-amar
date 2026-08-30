"use client";

import React, { createContext, useContext, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Language, TranslationSchema, translations } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  isArabic: boolean;
  dir: "ltr" | "rtl";
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Reads ?cms_edit=1&cms_lang=ar in its own Suspense boundary (useSearchParams
// requires one) without ever blocking LanguageProvider's own context value —
// children always see a valid context immediately, CMS-forced lang or not.
function CmsLangReader({ onChange }: { onChange: (lang: "ar" | "en" | null) => void }) {
  const searchParams = useSearchParams();
  const cmsLang = searchParams.get("cms_edit") === "1" ? searchParams.get("cms_lang") : null;
  const forced = cmsLang === "ar" || cmsLang === "en" ? cmsLang : null;

  useEffect(() => {
    onChange(forced);
  }, [forced, onChange]);

  return null;
}

function LanguageProviderInner({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [cmsLang, setCmsLang] = useState<"ar" | "en" | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = cmsLang || (localStorage.getItem("coach_amar_lang") as Language);
    if (saved === "ar" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = translations[saved].dir;
      if (saved === "ar") {
        document.documentElement.classList.add("arabic-mode");
      } else {
        document.documentElement.classList.remove("arabic-mode");
      }
    }
  }, [cmsLang]);

  const setLang = (newLang: Language) => {
    // While the CMS toolbar is forcing a language for editing, the page's own
    // language switch is disabled so the two controls can't fight each other.
    if (cmsLang) return;
    setLangState(newLang);
    localStorage.setItem("coach_amar_lang", newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = translations[newLang].dir;
    if (newLang === "ar") {
      document.documentElement.classList.add("arabic-mode");
    } else {
      document.documentElement.classList.remove("arabic-mode");
    }
  };

  const toggleLang = () => {
    const next: Language = lang === "en" ? "ar" : "en";
    setLang(next);
  };

  const dir = translations[lang].dir;
  const isArabic = lang === "ar";
  const t = translations[lang];

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        isArabic,
        dir,
        t,
      }}
    >
      <Suspense fallback={null}>
        <CmsLangReader onChange={setCmsLang} />
      </Suspense>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <LanguageProviderInner>{children}</LanguageProviderInner>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
