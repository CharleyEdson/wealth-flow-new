import { Input } from "@/components/ui/input";

export const FooterV3 = () => {
  return (
    <footer id="contact" className="bg-primary text-white py-9">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Newsletter and Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 mb-4">
          {/* Newsletter */}
          <div>
            <h3 className="text-xl text-accent mb-2.5">Stay informed, stay ahead</h3>
            <form className="flex gap-3">
              <Input 
                type="email" 
                name="email"
                placeholder="Your email" 
                required
                className="flex-1 px-3 py-3 rounded-lg border border-accent text-primary bg-white"
              />
              <button 
                type="submit"
                className="bg-secondary hover:bg-secondary/90 text-white px-5 py-3 rounded-lg border-none cursor-pointer transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Links */}
          <div className="flex gap-6 justify-start md:justify-end flex-wrap">
            <a href="/process" className="text-accent hover:underline no-underline">Process</a>
            <a href="#services" className="text-accent hover:underline no-underline">Services</a>
            <a href="#about" className="text-accent hover:underline no-underline">About</a>
            <a href="#contact" className="text-accent hover:underline no-underline">Contact</a>
            <a href="#adv" className="text-accent hover:underline no-underline">ADV</a>
            <a href="#privacy" className="text-accent hover:underline no-underline">Privacy</a>
            <a href="#disclosures" className="text-accent hover:underline no-underline">Disclosures</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4">
          <p className="text-accent text-xs m-0">
            © 2025 Wealth Being Advisors LLC
          </p>
          <p className="text-accent text-xs leading-relaxed mt-1.5">
            Charley Edson is an investment adviser representative of Wealth Being Advisors, a registered investment adviser.
            Wealth Being Advisors only conducts business in jurisdictions where it is properly registered, excluded, or exempt
            from registration requirements. This content is for informational purposes only and should not be construed as financial,
            legal, or tax advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
