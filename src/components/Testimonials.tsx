import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Retired Educator",
    content: "The team helped me navigate my retirement with confidence. Their personalized approach and attention to detail gave me peace of mind about my financial future.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Business Owner",
    content: "Outstanding service and expertise. They helped me develop a comprehensive wealth management strategy that has exceeded my expectations year after year.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Medical Professional",
    content: "I appreciate their fiduciary commitment and transparent approach. They truly have my best interests at heart and have helped me achieve financial independence.",
    rating: 5
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-32 bg-muted">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. See what our satisfied clients have to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50 hover:shadow-hover transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
                <div className="border-t border-border pt-4">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
