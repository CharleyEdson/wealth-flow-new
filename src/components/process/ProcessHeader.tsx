import { Navigation } from "@/components/page2/Navigation";

export const ProcessHeader = () => {
  return (
    <>
      <Navigation />
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-center text-foreground mb-4">
            Our Process
          </h1>
          <div className="max-w-5xl mx-auto border-b-2 border-border pb-12" />
        </div>
      </section>
    </>
  );
};
