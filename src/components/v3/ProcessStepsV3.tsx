const steps = [
  {
    number: "1",
    title: "Let's Talk",
    description: "We'll have a real conversation about your finances to see if it makes sense to work together. No pressure. No pitch."
  },
  {
    number: "2",
    title: "Get Clarity",
    description: "Understand where you are today, align on where you want to go, and build the path to get there."
  },
  {
    number: "3",
    title: "Live Wealthy",
    description: "With ongoing guidance and your finances optimized, you'll be able to live wealthy—on your terms."
  }
];

export const ProcessStepsV3 = () => {
  return (
    <section id="process" className="bg-card py-16 md:py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">
          How to get started
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className="bg-muted border border-border rounded-xl p-5"
            >
              <h3 className="text-xl font-heading text-primary mb-2">
                {step.number}) {step.title}
              </h3>
              <p className="text-muted-foreground m-0">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div>
          <a 
            href="#contact"
            className="inline-block bg-secondary hover:bg-secondary/90 text-white px-6 py-3.5 rounded-[10px] no-underline transition-colors"
          >
            Let's Get Started
          </a>
        </div>
      </div>
    </section>
  );
};
