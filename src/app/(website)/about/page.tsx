import { fetchAboutUs } from "@/lib/aboutUs";
import AboutUsPage from "@/components/website/AboutUs/Aboutpage";






export default async function AboutUs() {
  const about = await fetchAboutUs();



  return (
          <AboutUsPage aboutData={about} />
    
  );
}
