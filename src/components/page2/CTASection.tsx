import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section id="contact" className="py-20 md:py-32 bg-primary text-primary-foreground">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Ready to take control of your financial future?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Let's work together to build your personalized wealth strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Book a Consultation
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20"
            >
              Meet Charley
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
