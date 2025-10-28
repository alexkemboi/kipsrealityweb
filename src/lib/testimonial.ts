import { Testimonial } from "@/app/data/TestimonialData"; 

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/testimonials`, {
    cache: "no-store",
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
