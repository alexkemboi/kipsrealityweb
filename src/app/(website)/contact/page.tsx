import type { Metadata } from "next";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import Contact from "@/components/website/landing/ContactUs";
import { fetchCompanyInfo } from "@/lib/company-info";
import { fetchCTAs } from "@/lib/cta";

// Cached + fast, refresh every 5 minutes
export const revalidate = 300;

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

type CTA = {
  title?: string | null;
} & Record<string, unknown>;

type CompanyInfo = Awaited<ReturnType<typeof fetchCompanyInfo>>;

function pickContactCta(ctas: CTA[]): CTA | null {
  const normalized = (s?: string | null) => (s ?? "").trim().toLowerCase();
  const keywords = ["contact", "touch", "get in touch", "reach", "talk"];

  return (
    ctas.find((c) => keywords.some((k) => normalized(c.title).includes(k))) ??
    ctas[0] ??
    null
  );
}

export default async function Page() {
  let companyInfo: CompanyInfo | null = null;
  let ctas: CTA[] = [];

  const [companyInfoResult, ctasResult] = await Promise.allSettled([
    fetchCompanyInfo(),
    fetchCTAs("home"),
  ]);

  if (companyInfoResult.status === "fulfilled") {
    companyInfo = companyInfoResult.value;
  } else {
    console.error("Failed to fetch company info:", companyInfoResult.reason);
  }

  if (ctasResult.status === "fulfilled") {
    ctas = Array.isArray(ctasResult.value) ? (ctasResult.value as CTA[]) : [];
  } else {
    console.error("Failed to fetch CTAs:", ctasResult.reason);
  }

  const contactCta = pickContactCta(ctas);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Offset for sticky navbar */}
      <div className="pt-20">
        {companyInfo ? (
          <Contact companyInfo={companyInfo} cta={contactCta ?? null} />
        ) : (
          <section className="mx-auto max-w-5xl px-4 py-16">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-gray-900">
                Contact Us
              </h1>
              <p className="mt-2 text-gray-600">
                We’re unable to load contact information right now. Please try
                again shortly.
              </p>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
