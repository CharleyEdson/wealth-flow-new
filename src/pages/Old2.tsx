import { Navigation } from "@/components/page2/Navigation";
import { HeroSection } from "@/components/page2/HeroSection";
import { ClientQuestions } from "@/components/page2/ClientQuestions";
import { Comparison } from "@/components/page2/Comparison";
import { FounderSection } from "@/components/page2/FounderSection";
import { ProcessSection } from "@/components/page2/ProcessSection";
import { BlogSection } from "@/components/page2/BlogSection";
import { CTASection } from "@/components/page2/CTASection";

const Page2 = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ClientQuestions />
      <Comparison />
      <FounderSection />
      <ProcessSection />
      <BlogSection />
      <CTASection />
    </div>
  );
};

export default Page2;
