import { ReactNode } from "react";
import { AppSidebar } from "@/components/client/AppSidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--bg-base)]">
      <AppSidebar />
      <main className="flex-1 ml-64 p-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
