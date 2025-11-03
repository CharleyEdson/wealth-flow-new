import { Button } from "@/components/ui/button";

export const Pricing = () => {
  return (
    <section className="py-12 md:py-20 bg-muted">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-12">
            Pricing
          </h2>

          <div className="bg-card p-8 md:p-12 rounded-2xl border border-border shadow-lg mb-8">
            <div className="space-y-6">
              <div>
                <p className="text-lg text-foreground leading-relaxed">
                  We charge <span className="font-bold text-secondary text-2xl">$300/month</span> for on-going support.
                </p>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-foreground leading-relaxed">
                  If you have assets over <span className="font-semibold">$300,000</span> that we are managing,
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  then we charge a <span className="font-semibold text-secondary">1% fee</span> on those assets, and waive the on-going monthly fee.
                </p>
              </div>
            </div>
          </div>

          <Button 
            variant="default" 
            size="lg"
            className="bg-[hsl(190,70%,45%)] hover:bg-[hsl(190,70%,40%)] text-white"
          >
            Book a Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};
