"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type AdminSidebarContextType = {
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextType>({
  mobileOpen: false,
  toggleMobile: () => {},
  closeMobile: () => {},
});

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <AdminSidebarContext.Provider value={{ mobileOpen, toggleMobile, closeMobile }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}
