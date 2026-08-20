"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/client/AppSidebar";
import { useLanguage } from "@/lib/language-context";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isArabic, dir } = useLanguage();

  return (
    <div dir={dir} className={`min-h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)] ${isArabic ? "font-cairo" : ""}`}>
      <AppSidebar />
      <main className={`flex-1 ${isArabic ? "mr-64" : "ml-64"} p-6 sm:p-8 max-w-5xl transition-all`}>
        {children}
      </main>
    </div>
  );
}
