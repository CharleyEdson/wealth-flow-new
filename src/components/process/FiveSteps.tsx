import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    number: "1",
    title: "Let's Talk",
    description: "We'll talk about what's on your mind—goals, stress points, and what you want your money to do for you. No pressure, no pitch."
  },
  {
    number: "2",
    title: "Wealth Assessment",
    description: "We'll assess your entire financial picture, help you get clarity and discuss high level strategies to optimize your finances. We'll walk away knowing if it makes sense to continue work together and next steps."
  },
  {
    number: "3",
    title: "Getting Organized",
    description: "We'll centralize and gather all your financial details—assets, debt, income, accounts, benefits, and more—so we can give specific advice and you can finally see everything in one place."
  },
  {
    number: "4",
    title: "Wealth Implementation",
    description: "We'll collaborate on action steps, get clear on what to do, and implement. I will be helping every step of the way."
  },
  {
    number: "5",
    title: "Live Wealthy",
    description: "With ongoing support, regular check-ins, and access when you need it, you'll feel confident with your finances optimized—and free up your mind to focus on what you need to."
  }
];

export const FiveSteps = () => {
  return (
    <section className="py-12 md:py-20 bg-muted">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <Card key={step.number} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-[hsl(190,70%,45%)]">
                  {step.number} | {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
