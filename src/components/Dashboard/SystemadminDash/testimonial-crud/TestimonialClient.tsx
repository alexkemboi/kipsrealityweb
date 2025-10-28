"use client";

import React, { useEffect } from "react";
import { useTestimonial } from "./useTestimonial";
import TestimonialCard from "./TestimonialCard";
import { Testimonial } from "@/app/data/TestimonialData";

export default function TestimonialDashboard({
  initialSections = [],
}: {
  initialSections?: Testimonial[];
}) {
  const { sections, setTestimonials, handleUpdate, loading } = useTestimonial();

  // Load initial data
  useEffect(() => {
    if (initialSections.length > 0) {
      setTestimonials(initialSections);
    }
  }, [initialSections, setTestimonials]);

  if (loading && sections.length === 0)
    return <p className="p-6 text-gray-500">Loading...</p>;

  if (!sections || sections.length === 0)
    return <p className="p-6 text-gray-500">No Testimonials found.</p>;

  const handleChange = (
    id: number,
    field: keyof Testimonial,
    value: string
  ) => {
    setTestimonials((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {sections.map((section: Testimonial) => (
        <TestimonialCard
          key={section.id}
          section={section}
          onChange={handleChange}
          onSave={handleUpdate}
        />
      ))}
    </div>
  );
}
