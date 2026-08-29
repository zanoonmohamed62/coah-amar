import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Coach Amar",
  description: "Sign in to your coaching dashboard",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

