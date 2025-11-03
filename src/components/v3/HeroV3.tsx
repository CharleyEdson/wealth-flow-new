import { Button } from "@/components/ui/button";
import heroImage from "@/assets/page2-hero.jpg";

export const HeroV3 = () => {
  return (
    <section className="bg-muted py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary leading-tight mb-4">
              Invest smartly, spend boldly, and live wealthy.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-7">
              Financial clarity doesn't have to mean giving up what you love. We help mid-career 
              professionals get organized, optimize their money, and make confident choices about 
              how to spend, save, and grow their wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5">
              <a 
                href="#contact"
                className="inline-block bg-secondary hover:bg-secondary/90 text-white px-6 py-3.5 rounded-[10px] no-underline text-center transition-colors"
              >
                Schedule Your Intro Call
              </a>
              <a 
                href="#process"
                className="inline-block text-secondary border-2 border-secondary hover:bg-secondary/10 px-5 py-3 rounded-[10px] no-underline text-center transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
          
          {/* Right: Image */}
          <div>
            <img 
              src={heroImage} 
              alt="Mountain landscape at sunset representing financial clarity and peace"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
