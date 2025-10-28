import TestimonialClient from "@/components/Dashboard/SystemadminDash/testimonial-crud/TestimonialClient";
import { Testimonial } from "@/app/data/TestimonialData";

export default async function TestimonialsCRUDPage() {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/testimonials`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch About testimonials");
  }

  const sections: Testimonial[] = await res.json()
  return <TestimonialClient initialSections={sections} />;
}