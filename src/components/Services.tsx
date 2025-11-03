import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield, PiggyBank, Users, BarChart3, Landmark } from "lucide-react";

const services = [
  {
    icon: TrendingUp,
    title: "Wealth Management",
    description: "Strategic investment planning and portfolio management tailored to your financial goals and risk tolerance."
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Comprehensive insurance planning and risk assessment to protect your assets and loved ones."
  },
  {
    icon: PiggyBank,
    title: "Retirement Planning",
    description: "Build a secure retirement with personalized strategies designed to maximize your future income."
  },
  {
    icon: Users,
    title: "Estate Planning",
    description: "Preserve your legacy with expert estate planning services that ensure your wishes are fulfilled."
  },
  {
    icon: BarChart3,
    title: "Tax Optimization",
    description: "Minimize your tax burden through strategic planning and efficient investment structures."
  },
  {
    icon: Landmark,
    title: "Trust Services",
    description: "Professional trust management and fiduciary services for complex wealth preservation needs."
  }
];

export const Services = () => {
  return (
    <section id="services" className="py-20 md:py-32 bg-muted">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Comprehensive Financial Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We offer a full spectrum of wealth management solutions designed to help you achieve your financial objectives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 border-border/50"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-lg bg-gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
