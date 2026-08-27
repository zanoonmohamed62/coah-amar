"use client";

import { useSiteContent } from "@/lib/use-site-content";

export function SectionWrapper({
  sectionId,
  children,
}: {
  sectionId: string;
  children: React.ReactNode;
}) {
  const get = useSiteContent();
  const isHidden = get(sectionId, "_hidden", "0") === "1";
  if (isHidden) return null;
  return <>{children}</>;
}
