import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Lightbulb, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    number: "1",
    title: "Let's Talk",
    description: "We'll have a real conversation about your finances to see if it makes sense to work together. No pressure. No pitch."
  },
  {
    icon: Lightbulb,
    number: "2",
    title: "Get Clarity",
    description: "We'll help you understand where you are, and collaborate on where you want to go—and how to get there."
  },
  {
    icon: TrendingUp,
    number: "3",
    title: "Live Wealthy",
    description: "With ongoing guidance and your finances optimized, you'll be able to live wealthy—on your terms."
  }
];

export const ProcessSection = () => {
  return (
    <section id="process" className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
            How to get started
          </h2>
          <p className="text-xl text-secondary font-heading">Let's make this easy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} className="border-border hover:shadow-hover transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-8 h-8 text-secondary" />
                  </div>
                  <CardTitle className="text-xl text-center">
                    Step {step.number}) {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            variant="default" 
            size="lg"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Let's get Started
          </Button>
        </div>
      </div>
    </section>
  );
};
