// src/app/(website)/about/page.tsx
import { fetchAboutUs, fetchHeroSection, fetchCTA } from "@/lib/aboutUs";
import AboutUsPage from "@/components/website/AboutUs/Aboutpage";
import Navbar from "@/components/website/Navbar";

export default async function AboutUs() {
  // Fetch all data in parallel
  const [aboutData, heroData, ctaData] = await Promise.all([
    fetchAboutUs(),
    fetchHeroSection("about"),
    fetchCTA("about"),
  ]);

  return (
    <div>
    <Navbar/>
    <AboutUsPage 
      aboutData={aboutData} 
      heroData={heroData}
      ctaData={ctaData}
    />
    </div>
  );
}