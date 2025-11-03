import { ProcessHeader } from "@/components/process/ProcessHeader";
import { ProcessOverview } from "@/components/process/ProcessOverview";
import { FiveSteps } from "@/components/process/FiveSteps";
import { DetailedProcess } from "@/components/process/DetailedProcess";
import { ServicesIncluded } from "@/components/process/ServicesIncluded";
import { ProcessComparison } from "@/components/process/ProcessComparison";
import { Pricing } from "@/components/process/Pricing";

const Process = () => {
  return (
    <div className="min-h-screen">
      <ProcessHeader />
      <ProcessOverview />
      <FiveSteps />
      <DetailedProcess />
      <ServicesIncluded />
      <ProcessComparison />
      <Pricing />
    </div>
  );
};

export default Process;
