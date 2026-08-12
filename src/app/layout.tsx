import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LanguageProvider } from "@/lib/language-context";

const inter = { variable: "--font-inter" };
const outfit = { variable: "--font-outfit" };

export const metadata: Metadata = {
  title: "Coach Amar — Premium Fitness Coaching | كوتش عمار للتدريب الرياضي",
  description:
    "Personalized training, nutrition, and coaching built around your goals. Choose from a structured training plan or full personal coaching with Coach Amar.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Cairo:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <LayoutShell>{children}</LayoutShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
