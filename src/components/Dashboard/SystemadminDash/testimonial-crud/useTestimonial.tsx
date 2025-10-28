"use client";

import { useState } from "react";
import { Testimonial } from "@/app/data/TestimonialData";

export function useTestimonial() {
  const [sections, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error("Failed to fetch Testimonials:", error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (section: Testimonial) => {
    try {
      const res = await fetch(`/api/testimonials/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      await fetchSections(); // Refresh data after update
    } catch (error) {
      console.error("Failed to update section:", error);
    }
  };

  return { sections, setTestimonials, fetchSections, handleUpdate, loading };
}
