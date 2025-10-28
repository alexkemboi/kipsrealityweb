import { AboutUs } from "@/app/data/AboutUsData"; 

export const fetchAboutUs = async (): Promise<AboutUs[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/aboutsection`, {
    cache: "no-store",
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${response.url}`);
      throw new Error("Failed to fetch About sections");
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("fetchAboutUs:", error);
    return [];
  }
};
