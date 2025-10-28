import AboutSectionDashboard from "@/components/Dashboard/SystemadminDash/aboutUs-crud/AboutSectionDashboard";
import { AboutUs } from "@/app/data/AboutUsData";

export default async function AboutUsCRUDPage() {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/aboutsection`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch About sections");
  }

  const sections: AboutUs[] = await res.json()
  return <AboutSectionDashboard initialSections={sections} />;
}