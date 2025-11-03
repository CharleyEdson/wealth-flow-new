const wealthBeingFeatures = [
  "Personalized strategy",
  "No asset minimums",
  "Tax-aware planning",
  "Fee-only fiduciary",
  "CFP® guidance",
  "Regular meetings",
  "Modern client portal"
];

const typicalAdvisorFeatures = [
  "$1M minimums",
  "Little/no tax planning",
  "Not always fiduciary/CFP",
  "Minimal contact",
  "Outdated tech"
];

export const DifferenceComparisonV3 = () => {
  return (
    <section className="bg-muted py-16 md:py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">
          How Wealth Being is different
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Wealth Being Column */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-xl font-heading text-primary mb-3">Wealth Being</h3>
            <ul className="m-0 pl-5 text-muted-foreground leading-relaxed space-y-1">
              {wealthBeingFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Typical Advisor Column */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-xl font-heading text-primary mb-3">Typical Advisor</h3>
            <ul className="m-0 pl-5 text-muted-foreground leading-relaxed space-y-1">
              {typicalAdvisorFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <a 
            href="#contact"
            className="inline-block bg-secondary hover:bg-secondary/90 text-white px-6 py-3.5 rounded-[10px] no-underline transition-colors"
          >
            Get More Info
          </a>
        </div>
      </div>
    </section>
  );
};
