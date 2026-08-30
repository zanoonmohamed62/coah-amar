"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GoogleLeadBanner } from "@/components/GoogleLeadBanner";
import { CmsEditModeProvider } from "@/components/cms/CmsEditModeProvider";
import { Suspense } from "react";

function LayoutShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/app");
  const isCmsEdit = searchParams.get("cms_edit") === "1";

  if (isDashboard) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <CmsEditModeProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      {!isCmsEdit && <GoogleLeadBanner />}
    </CmsEditModeProvider>
  );
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main>{children}</main>}>
      <LayoutShellInner>{children}</LayoutShellInner>
    </Suspense>
  );
}
