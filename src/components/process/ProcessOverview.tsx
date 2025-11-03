import { Card, CardContent } from "@/components/ui/card";

export const ProcessOverview = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="bg-[hsl(195,50%,92%)] border-none">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">What is it:</h3>
              <p className="text-foreground leading-relaxed">
                This is the Wealth Being process. We get a clear understand of where you are, where 
                you want to go, and create a custom strategy to bridge the gap. We will help implement, 
                be your accountability partner, and be someone who is there to just talk to... for 
                whatever reason.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(195,50%,92%)] border-none">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Who it's for:</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You're earning $200k+</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You know your financial life matters—but don't have the time or interest to manage it yourself</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You value delegation, accountability, and someone to talk things through with ongoing</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <p className="text-lg text-foreground leading-relaxed">
            We work together to help you make smart decisions now—while still growing your wealth for 
            what's ahead. No generic templates. Just thoughtful strategy, real support, and a system 
            that fits your life.
          </p>
        </div>
      </div>
    </section>
  );
};
