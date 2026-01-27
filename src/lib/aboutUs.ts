import 'server-only';

// src/lib/aboutUs.ts
import { AboutUs } from "@/app/data/AboutUsData";
import { getServerBaseUrl } from "@/lib/server-base-url";

export interface HeroData {
  id: string;
  page: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  gradient?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface CTAData {
  id: string;
  page: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonUrl: string;
  gradient?: string;
}

export const fetchAboutUs = async (): Promise<AboutUs[]> => {
  try {
    const baseUrl = await getServerBaseUrl();
    const response = await fetch(`${baseUrl}/api/aboutsection`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error("Failed to fetch About sections");
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("fetchAboutUs error:", error);
    return [];
  }
};

export const fetchHeroSection = async (page: string = "about"): Promise<HeroData | null> => {
  try {
    const baseUrl = await getServerBaseUrl();
    const response = await fetch(`${baseUrl}/api/hero?page=${page}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error("Failed to fetch hero section");
    }

    const data = await response.json();
    // Return the first matching hero section for the page
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("fetchHeroSection error:", error);
    return null;
  }
};

export const fetchCTA = async (page: string = "about"): Promise<CTAData | null> => {
  try {
    const baseUrl = await getServerBaseUrl();
    const response = await fetch(`${baseUrl}/api/cta?page=${page}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error("Failed to fetch CTA");
    }

    const data: CTAData[] = await response.json();
    // Find CTA for the specific page
    const pageCTA = data.find((cta) => cta.page === page);
    return pageCTA || (data.length > 0 ? data[0] : null);
  } catch (error) {
    console.error("fetchCTA error:", error);
    return null;
  }
};