"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";
import { useLanguage } from "@/lib/language-context";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export function AdminShell({ children }: { children: ReactNode }) {
  const { isArabic, dir } = useLanguage();

  // One hour of inactivity ends an admin session — the panel can confirm
  // payments and read every customer's details. Customers are deliberately
  // never timed out (see src/lib/auth.config.ts).
  useSessionTimeout();

  return (
    <AdminSidebarProvider>
      {/* Order alerts are delivered through the service worker, so the panel
          needs one registered too — see ServiceWorkerRegistrar. */}
      <ServiceWorkerRegistrar />
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
