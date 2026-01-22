import 'server-only';

import { Testimonial } from "@/app/data/TestimonialData";
import { getServerBaseUrl } from "@/lib/server-base-url";

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const baseUrl = await getServerBaseUrl();
    const response = await fetch(`${baseUrl}/api/testimonials`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${response.url}`);
      throw new Error("Failed to fetch testimonials");
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error in fetchTestimonials:", error);
    return [];
  }
};
