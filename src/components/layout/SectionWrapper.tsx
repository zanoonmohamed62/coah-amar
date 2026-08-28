"use client";

import { useSiteContent } from "@/lib/use-site-content";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SectionWrapperInner({ sectionId, children }: { sectionId: string, children: React.ReactNode }) {
  const get = useSiteContent();
  const searchParams = useSearchParams();
  const previewSection = searchParams.get("preview_section");

  const isHidden = get(sectionId, "_hidden", "0") === "1";
  
  // If we are in section preview mode, ONLY show the active section
  if (previewSection) {
    if (previewSection !== sectionId) return null;
    // We show it even if isHidden is true, so the admin can edit and preview hidden sections!
    return <section id={sectionId} className={isHidden ? "opacity-50" : ""}>{children}</section>;
  }

  if (isHidden) return null;
  
  return <section id={sectionId}>{children}</section>;
}

export function SectionWrapper({
  sectionId,
  children,
}: {
  sectionId: string;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<section id={sectionId}>{children}</section>}>
      <SectionWrapperInner sectionId={sectionId}>{children}</SectionWrapperInner>
    </Suspense>
  );
}
