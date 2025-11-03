import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export const NavigationV3 = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 py-4 px-6">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/homepage-v3" className="flex items-center gap-3 no-underline">
          <span className="text-xl font-bold text-primary font-heading">
            Wealth Being Advisors
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="/process" className="text-primary hover:text-secondary transition-colors no-underline">
            Process
          </a>
          <a href="#services" className="text-primary hover:text-secondary transition-colors no-underline">
            Services
          </a>
          <a href="#about" className="text-primary hover:text-secondary transition-colors no-underline">
            About
          </a>
          <a href="#contact" className="text-primary hover:text-secondary transition-colors no-underline">
            Contact
          </a>
          <a href="#resources" className="text-primary hover:text-secondary transition-colors no-underline">
            Resources
          </a>
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-white rounded-lg"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Schedule a Call
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-7 w-7 text-primary" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 flex flex-col gap-4 pb-4">
          <a href="/process" className="text-primary hover:text-secondary transition-colors no-underline">
            Process
          </a>
          <a href="#services" className="text-primary hover:text-secondary transition-colors no-underline">
            Services
          </a>
          <a href="#about" className="text-primary hover:text-secondary transition-colors no-underline">
            About
          </a>
          <a href="#contact" className="text-primary hover:text-secondary transition-colors no-underline">
            Contact
          </a>
          <a href="#resources" className="text-primary hover:text-secondary transition-colors no-underline">
            Resources
          </a>
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-white rounded-lg w-full"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Schedule a Call
          </Button>
        </nav>
      )}
    </header>
  );
};
