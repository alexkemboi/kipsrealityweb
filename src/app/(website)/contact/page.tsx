import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import Contact from "@/components/website/landing/ContactUs";
import { fetchCompanyInfo } from "@/lib/company-info";
import { fetchCTAs } from "@/lib/cta";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [companyInfo, ctas] = await Promise.all([
    fetchCompanyInfo(),
    fetchCTAs("home"),
  ]);

  const contactCta = ctas.find(c => c.title.toLowerCase().includes("touch") || c.title.toLowerCase().includes("contact"));

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Spacer for sticky navbar if needed, or just let it flow */}
      <div className="pt-20">
        <Contact companyInfo={companyInfo} cta={contactCta} />
      </div>

      <Footer />
    </main>
  );
}
