"use client";

import { useSiteContent } from "@/lib/use-site-content";
import { useCmsEditMode } from "@/components/cms/CmsEditModeProvider";

export function SectionWrapper({
  sectionId,
  children,
}: {
  sectionId: string;
  children: React.ReactNode;
}) {
  const get = useSiteContent();
  const { active } = useCmsEditMode();
  const isHidden = get(sectionId, "_hidden", "0") === "1";

  // In CMS edit mode, still show hidden sections (dimmed) so the admin can edit them
  // before re-enabling — everywhere else, a hidden section renders nothing at all.
  if (isHidden && !active) return null;

  return (
    <div id={sectionId} style={isHidden ? { opacity: 0.45 } : undefined}>
      {children}
    </div>
  );
}
