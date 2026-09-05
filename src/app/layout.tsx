import type { Metadata } from "next";
import { Inter, Outfit, Cairo, Alexandria } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LanguageProvider } from "@/lib/language-context";
import { SessionWrapper } from "@/components/providers/SessionWrapper";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});
const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-alexandria",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://amarel7ewety.com"),
  title: "Coach Amar — Premium Fitness Coaching | كوتش عمار للتدريب الرياضي",
  description:
    "Personalized training, nutrition, and coaching built around your goals. Choose from a structured training plan or full personal coaching with Coach Amar.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2",
  },
  keywords: [
    "fitness coaching",
    "personal trainer",
    "training plan",
    "nutrition coaching",
    "Coach Amar",
    "كوتش عمار",
    "تدريب شخصي",
    "دايت وتمرين",
    "Egypt fitness",
  ],
  openGraph: {
    title: "Coach Amar — Premium Fitness Coaching",
    description:
      "Build the body. Build the system. Personalized training and coaching.",
    type: "website",
    images: ["/assets/coach-portrait.png"],
  },
};

import { LayoutShell } from "@/components/layout/layout-shell";
import { PWAInstallProvider } from "@/lib/pwa-install-context";
import { SWKillSwitch } from "@/components/SWKillSwitch";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${cairo.variable} ${alexandria.variable}`}
    >
      <head>
        {/* PWA & Icons */}
        <link rel="manifest" href="/manifest.json?v=2" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AMAR X" />
      </head>
      <body>
        <SWKillSwitch />
        <SessionWrapper>
          <PWAInstallProvider>
            <LanguageProvider>
              <LayoutShell>{children}</LayoutShell>
            </LanguageProvider>
          </PWAInstallProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
