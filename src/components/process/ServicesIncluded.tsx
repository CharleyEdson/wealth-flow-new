import { Button } from "@/components/ui/button";

const services = [
  "Cash Flow & Budgeting",
  "Assets & Debt Review",
  "Money Mindset",
  "Goals Setting",
  "Investing",
  "Retirement & Projections",
  "Tax Planning",
  "Insurance Review",
  "Estate Planning"
];

const additionalServices = [
  "Equity Compensation",
  "Education Funding",
  "Student Loan + Debt Repayment",
  "Business Planning or Career Shifts",
  "Ongoing Check-ins",
  "Anytime Access"
];

export const ServicesIncluded = () => {
  return (
    <section className="py-12 md:py-20 bg-muted">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-center text-foreground mb-4">
            Comprehensive Financial Planning
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            What is included
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-lg border border-border text-center hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-foreground">{service}</h3>
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <p className="text-2xl font-heading font-bold text-secondary">Plus</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {additionalServices.map((service, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-lg border border-secondary/30 text-center hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-foreground">{service}</h3>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="default" 
              size="lg"
              className="bg-[hsl(190,70%,45%)] hover:bg-[hsl(190,70%,40%)] text-white"
            >
              Schedule your Intro Meeting
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
