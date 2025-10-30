import { fetchAboutUs } from "@/lib/aboutUs";
import AboutUsPage from "@/components/website/AboutUs/Aboutpage";
export default async function AboutUs() {
  const about = await fetchAboutUs();


interface HeroData {
  title: string;
  subtitle: string;
  imageUrl: string;
  gradient?: string;
}

  return (
          <AboutUsPage aboutData={about} />
    
  );
}
