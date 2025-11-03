import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const detailedSteps = [
  {
    number: "1",
    title: "Where Do You Want To Go?",
    description: "We start with the core of who you are. This is more than just numbers—we focus on what makes you, you. Together, we'll uncover your goals, values, and vision for your life.",
    questions: [
      "What brings you joy?",
      "What would financial freedom look like for you?",
      "What do you value most?",
      "What milestones do you want to achieve?",
      "What's your current financial picture?"
    ],
    footer: "These conversations help us craft a financial strategy that's not just about money, but about building a life that feels true to you."
  },
  {
    number: "2",
    title: "Analyze",
    description: "Now we get into the details. We'll look at your full financial picture—what you earn, spend, own, and owe. By analyzing your cash flow, accounts, and habits, we'll get a clear understanding of your financial health. We use tools like RightCapital or the Elements app so you can easily see and manage everything in one secure, visual platform."
  },
  {
    number: "3",
    title: "Strategy",
    description: "This is where the magic happens. After understanding you and analyzing your current financial state, we'll create a personalized strategy together. This plan is designed to set you up for the future you envision. With the help of apps, we'll keep tasks and goals on track so you always know what's next."
  },
  {
    number: "4",
    title: "Implementation",
    description: "Time to put the plan into action. We'll help set up your investment accounts, create budgets, and give you access to our suite of tools. This is where your journey truly begins, and we'll be right by your side as you take those first steps."
  },
  {
    number: "5",
    title: "Ongoing Coaching & Support",
    description: "We're here for the long haul. With consistent feedback, regular monitoring, and open communication, you'll never feel alone in managing your financial journey. We offer unlimited messaging through our app so you can reach out whenever you need advice or just a quick check-in."
  }
];

export const DetailedProcess = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {detailedSteps.map((step) => (
            <Card key={step.number} className="border-l-4 border-l-secondary">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">
                  {step.number} | {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  {step.description}
                </p>
                {step.questions && (
                  <div className="space-y-2 pl-4">
                    <p className="font-semibold text-foreground">We ask questions like:</p>
                    <ul className="space-y-1">
                      {step.questions.map((question, idx) => (
                        <li key={idx} className="text-foreground">{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.footer && (
                  <p className="text-foreground leading-relaxed italic">
                    {step.footer}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
