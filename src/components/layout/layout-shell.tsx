"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GoogleLeadBanner } from "@/components/GoogleLeadBanner";
import { Suspense } from "react";

function LayoutShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewSection = searchParams.get("preview_section");
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/app");

  if (isDashboard) {
    return <main className="min-h-screen">{children}</main>;
  }

  const showNav = !previewSection || previewSection === "nav";
  const showFooter = !previewSection || previewSection === "footer";

  return (
    <>
      {showNav && <Navbar />}
      <main>{children}</main>
      {showFooter && <Footer />}
      <GoogleLeadBanner />
    </>
  );
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main>{children}</main>}>
      <LayoutShellInner>{children}</LayoutShellInner>
    </Suspense>
  );
}
