"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";
import { useLanguage } from "@/lib/language-context";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isArabic, dir } = useLanguage();

  return (
    <AdminSidebarProvider>
      <div
        dir={dir}
        className={`min-h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)] ${
          isArabic ? "font-cairo" : ""
        }`}
      >
        <AdminSidebar />
        <div className={`flex-1 ${isArabic ? "md:mr-64" : "md:ml-64"} flex flex-col min-w-0 transition-all duration-200`}>
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
