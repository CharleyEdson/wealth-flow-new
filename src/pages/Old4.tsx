import { NavigationV3 } from "@/components/v3/NavigationV3";
import { HeroV3 } from "@/components/v3/HeroV3";
import { ClientPainPointsV3 } from "@/components/v3/ClientPainPointsV3";
import { DifferenceComparisonV3 } from "@/components/v3/DifferenceComparisonV3";
import { ProcessStepsV3 } from "@/components/v3/ProcessStepsV3";
import { AboutFounderV3 } from "@/components/v3/AboutFounderV3";
import { FooterV3 } from "@/components/v3/FooterV3";

const HomepageV3 = () => {
  return (
    <main className="min-h-screen">
      <NavigationV3 />
      <HeroV3 />
      <ClientPainPointsV3 />
      <DifferenceComparisonV3 />
      <ProcessStepsV3 />
      <AboutFounderV3 />
      <FooterV3 />
    </main>
  );
};

export default HomepageV3;
