import charleyImage from "@/assets/charley.jpg";

export const AboutFounderV3 = () => {
  return (
    <section id="about" className="bg-muted py-16 md:py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 items-center">
          <div>
            <img 
              src={charleyImage} 
              alt="Portrait of Charley Edson, CFP®" 
              className="w-full h-auto rounded-xl"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Meet the Founder
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You've worked hard, built a great career, and are earning more than ever—but you're 
              still not sure if you're doing things "right." That's where I come in.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              I started Wealth Being Advisors to help busy professionals in their 30s and 40s 
              simplify, organize, and optimize their finances—so they can spend with confidence, 
              invest wisely, and stop second-guessing themselves.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-5">
              This isn't just about building wealth. It's about using your money to live fully 
              now and in the future.
            </p>
            <a 
              href="#contact"
              className="inline-block bg-secondary hover:bg-secondary/90 text-white px-6 py-3.5 rounded-[10px] no-underline transition-colors"
            >
              Schedule Your Intro Call
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
