export const BlogSection = () => {
  return (
    <section id="blog" className="py-20 md:py-32 bg-muted">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Research & Ideas
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore to learn how to cultivate your Financial, Physical, and Mental well-being.
          </p>
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground text-lg">Check back soon</p>
            <p className="text-muted-foreground mt-2">
              Once posts are published, you'll see them here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
