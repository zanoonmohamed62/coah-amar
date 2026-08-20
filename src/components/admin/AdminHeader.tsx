"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Bell, Shield, Search } from "lucide-react";
import { useEffect, useState } from "react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Executive Overview", subtitle: "Real-time athletic business & revenue performance" },
  "/admin/orders": { title: "Order Operations", subtitle: "Process payments, approvals, and transaction records" },
  "/admin/customers": { title: "Athlete Directory", subtitle: "Manage clients, program access, and subscriptions" },
  "/admin/products": { title: "Products & Plans", subtitle: "Configure packages, pricing, and active offers" },
  "/admin/programs": { title: "Training Builder", subtitle: "Design splits, daily workouts, and exercise cues" },
  "/admin/media": { title: "Media Library", subtitle: "Video demonstrations, transformation photos, and assets" },
  "/admin/cms": { title: "Website CMS", subtitle: "Control marketing copy, translations, and homepage sections" },
  "/admin/preview": { title: "Live Site Preview", subtitle: "Interactive sandbox preview of all platform pages" },
  "/admin/settings": { title: "Platform Settings", subtitle: "Payment handles, WhatsApp config, and platform defaults" },
};

export function AdminHeader() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  const matched = Object.entries(pageTitles).find(([route]) =>
    route === pathname || (route !== "/admin" && pathname.startsWith(route))
  );

  const info = matched ? matched[1] : { title: "Admin Portal", subtitle: "Coach Amar Management Suite" };

  useEffect(() => {
    fetch("/api/admin/orders?status=AWAITING_CONFIRMATION")
      .then((r) => r.json())
      .then((d) => setPendingCount(d.orders?.length || 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div>
        <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
          {info.title}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{info.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {pendingCount > 0 && (
          <Link
            href="/admin/orders?status=AWAITING_CONFIRMATION"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {pendingCount} Pending Payment{pendingCount > 1 ? "s" : ""}
          </Link>
        )}

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors"
        >
          <ExternalLink size={13} />
          <span>Live Site</span>
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)]">
          <div className="w-8 h-8 rounded-sm bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] font-bold text-xs">
            CA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">Coach Amar</p>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight flex items-center gap-1">
              <Shield size={9} className="text-emerald-400" /> Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
