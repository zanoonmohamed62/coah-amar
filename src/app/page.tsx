import { HeroSection } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { ProblemSection } from "@/components/sections/problem";
import { TwoPathsSection } from "@/components/sections/two-paths";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { CoachSection } from "@/components/sections/coach";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FAQSection } from "@/components/sections/faq";
import { FinalCTASection } from "@/components/sections/final-cta";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export default function HomePage() {
  return (
    <>
      <SectionWrapper sectionId="hero"><HeroSection /></SectionWrapper>
      <SectionWrapper sectionId="trust"><TrustStrip /></SectionWrapper>
      <SectionWrapper sectionId="problem"><ProblemSection /></SectionWrapper>
      <SectionWrapper sectionId="pricing"><TwoPathsSection /></SectionWrapper>
      <SectionWrapper sectionId="howItWorks"><HowItWorksSection /></SectionWrapper>
      <SectionWrapper sectionId="coach"><CoachSection /></SectionWrapper>
      <SectionWrapper sectionId="testimonials"><TestimonialsSection /></SectionWrapper>
      <SectionWrapper sectionId="faq"><FAQSection /></SectionWrapper>
      <SectionWrapper sectionId="finalCta"><FinalCTASection /></SectionWrapper>
    </>
  );
}
