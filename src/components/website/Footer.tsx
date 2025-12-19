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
    <footer className="bg-[#0c1b33] text-white py-12 border-t border-blue-900">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left section - copyright */}
        <p className="text-sm font-medium text-center md:text-left text-blue-100/70">
          © {new Date().getFullYear()} RentFlow360. All rights reserved.
        </p>

        {/* Center section - navigation links */}
        <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="text-white hover:text-blue-100 transition-colors duration-200"
              >
                {link.name}
              </a>
            </li>
          ))}

          <li>
            <a
              href="/privacypolicy"
              className="text-white hover:text-blue-100 transition-colors duration-200"
            >
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
