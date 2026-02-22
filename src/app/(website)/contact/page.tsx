import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import Contact from "@/components/website/landing/ContactUs";
import { fetchCompanyInfo } from "@/lib/company-info";
import { fetchCTAs } from "@/lib/cta";

export const dynamic = "force-dynamic";

export default async function Page() {
  let companyInfo: Awaited<ReturnType<typeof fetchCompanyInfo>> | null = null;
  let ctaData: Awaited<ReturnType<typeof fetchCTAs>> | [] = [];

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
    ctaData = ctasResult.value;
  } else {
    console.error("Failed to fetch CTAs:", ctasResult.reason);
  }

  const safeCtas = Array.isArray(ctaData) ? ctaData : [];

  const contactCta = safeCtas.find((c) => {
    const title = typeof c?.title === "string" ? c.title.toLowerCase() : "";
    return title.includes("touch") || title.includes("contact");
  });

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Spacer for sticky navbar */}
      <div className="pt-20">
        {companyInfo ? (
          <Contact companyInfo={companyInfo} cta={contactCta} />
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
