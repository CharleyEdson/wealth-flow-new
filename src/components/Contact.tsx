import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your inquiry! We'll be in touch within 24 hours.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take the first step toward financial confidence. Schedule a complimentary consultation today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-2">
                  <Phone className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  <a href="tel:+18005551234" className="hover:text-secondary transition-colors">
                    (800) 555-1234
                  </a>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  <a href="mailto:contact@premierfinancial.com" className="hover:text-secondary transition-colors break-all">
                    contact@premierfinancial.com
                  </a>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">Office</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  123 Financial Plaza<br />
                  New York, NY 10001
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              <CardDescription className="text-base">
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your financial goals..."
                    className="min-h-32 resize-none"
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Schedule Consultation
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
