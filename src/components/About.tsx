import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import advisorPortrait from "@/assets/advisor-portrait.jpg";

const credentials = [
  "Certified Financial Planner (CFP®)",
  "Chartered Financial Analyst (CFA)",
  "25+ Years Experience",
  "Fiduciary Standard"
];

const stats = [
  { value: "$2.5B+", label: "Assets Under Management" },
  { value: "500+", label: "Satisfied Clients" },
  { value: "25+", label: "Years of Excellence" },
  { value: "98%", label: "Client Retention" }
];

export const About = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img 
                src={advisorPortrait} 
                alt="Professional financial advisor"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-8 -right-8 bg-card p-6 rounded-xl shadow-hover border border-border hidden lg:block">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">$2.5B+</div>
                <div className="text-sm text-muted-foreground">Assets Managed</div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20">
              About Us
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Your Trusted Partner in{" "}
              <span className="text-secondary">Financial Success</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              With over 25 years of experience in wealth management and financial planning, 
              we've helped hundreds of families achieve their financial dreams. Our personalized 
              approach ensures that every strategy is tailored to your unique situation and goals.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              As fiduciary advisors, we are legally and ethically bound to act in your best interest. 
              This commitment to transparency and integrity is the foundation of every relationship we build.
            </p>

            {/* Credentials */}
            <div className="space-y-3 mb-8">
              {credentials.map((credential, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-foreground font-medium">{credential}</span>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl md:text-3xl font-bold text-secondary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
