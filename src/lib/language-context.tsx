"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("coach_amar_lang") as Language;
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
  }, []);

  const setLang = (newLang: Language) => {
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
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
