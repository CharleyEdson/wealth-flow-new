import { Button } from "@/components/ui/button";
import heroImage from "@/assets/page2-hero.jpg";

export const HeroSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Invest <span className="text-secondary">smartly</span>, spend{" "}
              <span className="text-secondary">boldly</span>, and live{" "}
              <span className="text-secondary">wealthy</span>.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Financial clarity doesn't have to mean giving up what you love. We help mid career 
              professionals get organized, optimize their money, and make confident choices about 
              how to spend, save, and grow their wealth.
            </p>
            <Button 
              variant="default" 
              size="lg" 
              className="bg-[hsl(190,70%,45%)] hover:bg-[hsl(190,70%,40%)] text-white"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Schedule Your Intro Call
            </Button>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-elegant">
            <img 
              src={heroImage} 
              alt="A landscape view of mountains with the sunset in the background"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
