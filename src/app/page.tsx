import { HeroSection } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { ProblemSection } from "@/components/sections/problem";
import { TwoPathsSection } from "@/components/sections/two-paths";
import { TrainingPlanSection } from "@/components/sections/training-plan-detail";
import { CoachingDetailSection } from "@/components/sections/coaching-detail";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { CoachSection } from "@/components/sections/coach";
import { FAQSection } from "@/components/sections/faq";
import { FinalCTASection } from "@/components/sections/final-cta";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ProblemSection />
      <TwoPathsSection />
      <TrainingPlanSection />
      <CoachingDetailSection />
      <HowItWorksSection />
      <CoachSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
