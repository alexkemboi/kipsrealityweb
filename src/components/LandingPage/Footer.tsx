const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "#pricing" },
  { name: "Integrations", href: "#integrations" },
  { name: "About", href: "#about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#041126] text-gray-600 py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Left section - logo or copyright */}
        <p className="text-sm text-center md:text-left mb-4 md:mb-0">
          © {new Date().getFullYear()} KIPS REALITY. All rights reserved.
        </p>

        {/* Center section - navigation links */}
        <ul className="flex flex-wrap justify-center gap-4 text-sm">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {link.name}
              </a>
            </li>
          ))}

          <li>
            <a
              href="/privacypolicy"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
