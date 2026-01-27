import { fetchAboutUs, fetchHeroSection } from "@/lib/aboutUs";
import { fetchTestimonials } from "@/lib/testimonial";
import AboutUsPage from "@/components/website/AboutUs/Aboutpage";
import Navbar from "@/components/website/Navbar";
import OurTeam from "@/components/website/landing/OurTeam";
import { Testimonials } from "@/components/website/Testimonial/TestimonialClient";
import BrandPromise from "@/components/website/landing/BrandPromise";
import Footer from "@/components/website/Footer";

export const dynamic = "force-dynamic"; // Ensure dynamic rendering if needed, or remove for static with revalidate

export default async function AboutUs() {
  // Fetch data in parallel
  const [aboutData, heroData, testimonials] = await Promise.all([
    fetchAboutUs(),
    fetchHeroSection("about"),
    fetchTestimonials(),
  ]);

  return (
    <div className="bg-white">
      <Navbar />

      {/* Sections 1, 2, 3: Who We Are, Our Story, Our Vision */}
      <AboutUsPage
        aboutData={aboutData}
        heroData={heroData}
      />

      {/* Section 4: Our Team */}
      <OurTeam />

      {/* Section 5: What Our Customers Say */}
      <Testimonials initialTestimonials={testimonials} />

      {/* Section 6: Our Brand Promise */}
      <BrandPromise />

      <Footer />
    </div>
  );
}