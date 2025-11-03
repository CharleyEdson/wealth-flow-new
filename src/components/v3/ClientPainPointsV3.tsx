const questions = [
  "How do I optimize my finances to grow for my life goals, while still enjoying life now?",
  "Can I afford spur-of-the-moment concert tickets—and still buy a home next year?",
  "How is my spending affecting my future—and how do I get it aligned?",
  "What's the smartest way to invest what I've earned?",
  "How do I actually act like I'm financially in my 30s?"
];

export const ClientPainPointsV3 = () => {
  return (
    <section className="bg-card py-16 md:py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">
          You work hard. Your money should too.
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Most of our clients come to us with the same questions.
        </p>

        <ul className="list-none p-0 m-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((question, index) => (
            <li 
              key={index}
              className="bg-muted border border-border rounded-[10px] p-4 text-primary"
            >
              {question}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
