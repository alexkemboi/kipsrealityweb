import type { Metadata } from "next";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import Contact from "@/components/website/landing/ContactUs";
import { fetchCompanyInfo } from "@/lib/company-info";
import { fetchCTAs } from "@/lib/cta";

// ✅ Better than force-dynamic for most marketing pages:
// cached + fast, but refreshes regularly
export const revalidate = 300; // 5 minutes

export const metadata: Metadata = {
  title: "Contact Us | Kips Reality",
  description:
    "Get in touch with Kips Reality. Ask a question, request a demo, or learn more about our property and real estate solutions.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | Kips Reality",
    description:
      "Get in touch with Kips Reality. Ask a question, request a demo, or learn more about our real estate solutions.",
    url: "/contact",
    siteName: "Kips Reality",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Kips Reality",
    description:
      "Get in touch with Kips Reality. Ask a question, request a demo, or learn more about our real estate solutions.",
  },
  robots: { index: true, follow: true },
};

type CTA = { title?: string } & Record<string, any>;

function pickContactCta(ctas: CTA[]) {
  const normalized = (s?: string) => (s ?? "").trim().toLowerCase();
  const keywords = ["contact", "touch", "get in touch", "reach", "talk"];

  return (
    ctas.find((c) => keywords.some((k) => normalized(c.title).includes(k))) ??
    ctas[0] ??
    null
  );
}

export default async function Page() {
  let companyInfo: any = null;
  let ctas: CTA[] = [];

  try {
    const result = await Promise.all([fetchCompanyInfo(), fetchCTAs("home")]);
    companyInfo = result[0];
    ctas = Array.isArray(result[1]) ? result[1] : [];
  } catch (err) {
    // Fail soft: render the page with whatever you can
    console.error("Contact page data load failed:", err);
  }

  const contactCta = pickContactCta(ctas);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Offset for sticky navbar */}
      <div className="pt-20">
        <Contact companyInfo={companyInfo} cta={contactCta} />
      </div>

      <Footer />
    </main>
  );
}
