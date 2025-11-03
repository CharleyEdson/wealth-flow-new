import workHardImage from "@/assets/work-hard.jpg";

const questions = [
  "How do I optimize my finances to grow for my life goals, while still enjoying life now?",
  "Can I afford those spur-of-the-moment concert tickets—and still buy a home next year?",
  "How is my spending affecting my future—and how do I get it aligned?",
  "What's the smartest way to invest what I've earned?",
  "How do I actually act like I'm financially in my 30s?"
];

export const ClientQuestions = () => {
  return (
    <section className="py-20 md:py-32 bg-[hsl(195,50%,97%)]">
      <div className="container px-4">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-center text-foreground mb-4">
          You work hard. Your money should too.
        </h2>
        <p className="text-lg text-center text-muted-foreground mb-12">
          Most of our clients come to us with the same questions:
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={workHardImage} 
              alt="Professional workspace"
              className="w-full h-auto"
            />
          </div>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-foreground text-base italic">"{question}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
