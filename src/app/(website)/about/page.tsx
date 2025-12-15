// src/app/(website)/about/page.tsx
import { getAboutUsData, getHeroSectionData, getCTAData } from "@/lib/server/website-data";
import AboutUsPage from "@/components/website/AboutUs/Aboutpage";
import Navbar from "@/components/website/Navbar";

export const dynamic = "force-dynamic"; // Ensure dynamic rendering if needed, or remove for static with revalidate

export default async function AboutUs() {
  // Fetch all data in parallel
  const [aboutData, heroData, ctaData] = await Promise.all([
    getAboutUsData(),
    getHeroSectionData("about"),
    getCTAData("about"),
  ]);

  return (
    <div>
      <Navbar />
      <AboutUsPage
        aboutData={aboutData}
        heroData={heroData}
        ctaData={ctaData}
      />
    </div>
  );
}