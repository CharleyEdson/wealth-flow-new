import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-heading font-bold mb-4 text-secondary">
              Premier Financial
            </h3>
            <p className="text-primary-foreground/80 mb-4">
              Your trusted partner in building lasting wealth and financial security.
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>123 Financial Plaza, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <a href="tel:+18005551234" className="hover:text-secondary transition-colors">
                  (800) 555-1234
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                <a href="mailto:contact@premierfinancial.com" className="hover:text-secondary transition-colors">
                  contact@premierfinancial.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#services" className="hover:text-secondary transition-colors">Wealth Management</a></li>
              <li><a href="#services" className="hover:text-secondary transition-colors">Retirement Planning</a></li>
              <li><a href="#services" className="hover:text-secondary transition-colors">Estate Planning</a></li>
              <li><a href="#services" className="hover:text-secondary transition-colors">Tax Optimization</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Compliance</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Disclosures</a></li>
            </ul>
            <div className="mt-6 text-sm text-primary-foreground/60">
              <p>SEC Registered Investment Advisor</p>
              <p className="mt-2">FINRA Member | SIPC Member</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {currentYear} Premier Financial Advisors. All rights reserved.</p>
          <p className="mt-2">
            Investment advisory services offered through Premier Financial Advisors, a registered investment advisor.
          </p>
        </div>
      </div>
    </footer>
  );
};
