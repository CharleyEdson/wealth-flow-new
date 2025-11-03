import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wheat } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/page2" className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-secondary rounded-md flex items-center justify-center">
              <Wheat className="w-7 h-7 text-secondary" />
            </div>
            <span className="text-lg font-heading font-semibold text-foreground">
              Wealth Being Advisors
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/process" className="text-foreground hover:text-secondary transition-colors">
              Process
            </Link>
            <a href="#process" className="text-foreground hover:text-secondary transition-colors">
              Process
            </a>
            <a href="#about" className="text-foreground hover:text-secondary transition-colors">
              About
            </a>
            <a href="#contact" className="text-foreground hover:text-secondary transition-colors">
              Contact
            </a>
            <a href="#blog" className="text-foreground hover:text-secondary transition-colors">
              Blog
            </a>
            <a href="#wealth-check" className="text-foreground hover:text-secondary transition-colors">
              Wealth Check
            </a>
          </div>

          <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};
