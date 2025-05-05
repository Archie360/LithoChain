import { Link } from "wouter";
import { Layers } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    platform: [
      { name: "Marketplace", href: "/marketplace" },
      { name: "Job Submission", href: "/jobs/new" },
      { name: "Results", href: "/jobs" },
      { name: "Analytics", href: "/analytics" }
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/docs/api" },
      { name: "Model Guidelines", href: "/docs/model-guidelines" },
      { name: "Tutorials", href: "/docs/tutorials" }
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Partners", href: "/partners" },
      { name: "Contact", href: "/contact" }
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Licensing", href: "/licensing" },
      { name: "Cookie Policy", href: "/cookies" }
    ]
  };

  return (
    <footer className="bg-white border-t border-neutral-lighter mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center">
            <Layers className="h-5 w-5 text-primary mr-2" />
            <span className="text-lg font-semibold text-neutral-dark">LithoChain</span>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-sm text-neutral">© {currentYear} LithoChain. All rights reserved.</p>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-dark tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-neutral hover:text-neutral-dark">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-dark tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-neutral hover:text-neutral-dark">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-dark tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-neutral hover:text-neutral-dark">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-dark tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-neutral hover:text-neutral-dark">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
