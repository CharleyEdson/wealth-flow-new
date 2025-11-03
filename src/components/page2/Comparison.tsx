import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const wealthBeingFeatures = [
  "Creates a highly personalized & comprehensive strategy",
  "No asset minimums",
  "Ongoing tax-aware planning",
  "Fee-only and always a fiduciary",
  "Certified Financial Planner (CFP®) professional",
  "Regular Meetings & access",
  "Client portal & cutting edge tech"
];

const typicalAdvisorFeatures = [
  "General Planning",
  "$1m+ asset minimums",
  "No Tax Planning",
  "Not always a fiduciary and paid by fees",
  "Not always a Certified Financial Planner (CFP®) professional",
  "Minimal contact & support",
  "Old technology"
];

export const Comparison = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-center text-foreground mb-16">
          How Wealth Being is different
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          <Card className="border-2 border-secondary shadow-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-secondary">
                Wealth Being
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {wealthBeingFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-muted-foreground">
                Typical Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typicalAdvisorFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            variant="default" 
            size="lg"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Click to Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};
