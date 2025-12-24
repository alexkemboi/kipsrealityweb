const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/plans" },
  { name: "Integrations", href: "#integrations" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#003b73] text-white py-12">
      <div className="site-container flex flex-col md:flex-row items-center md:justify-center gap-4">
        {/* Left section - copyright */}
        <p className="text-sm font-medium text-center md:text-left text-white/90">
          © {new Date().getFullYear()} RentFlow360. All rights reserved.
        </p>

        {/* Center section - navigation links */}
          <ul className="flex flex-wrap items-center justify-start gap-6 text-sm font-medium md:ml-4">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="text-white hover:text-white/80 transition-colors duration-200"
              >
                {link.name}
              </a>
            </li>
          ))}

          <li>
            <a
              href="/privacypolicy"
              className="text-white hover:text-white/80 transition-colors duration-200"
            >
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
