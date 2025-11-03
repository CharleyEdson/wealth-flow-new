import charleyImage from "@/assets/charley.jpg";

export const FounderSection = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-muted">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
            <div className="md:w-1/3">
              <img 
                src={charleyImage} 
                alt="Charley Edson, CFP®"
                className="w-full rounded-2xl shadow-elegant"
              />
              <p className="text-center mt-4 text-sm text-muted-foreground">
                Charley Edson, CFP® // Founder of Wealth Being Advisors
              </p>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                Meet the Founder
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  You've worked hard, built a great career, and are earning more than ever—but 
                  you're still not sure if you're doing things "right" or in the most efficient 
                  way. That's where I come in.
                </p>
                <p>
                  I started Wealth Being Advisors based on everything I believe about money and 
                  life. I work with busy, high-performing professionals in their 30s and 40s who 
                  want to simplify, organize, and optimize their finances—so they can spend with 
                  confidence, invest wisely, and stop second-guessing themselves.
                </p>
                <p>
                  This isn't just about building wealth. It's about using your money to live 
                  fully now and in the future.
                </p>
                <p>
                  I'm not here to pitch you a 5-step plan to build an Airbnb empire. I'm here 
                  to help you create intentional money habits that support your version of a 
                  meaningful, wealthy life—whatever that looks like to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
