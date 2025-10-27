"use client";
import React from "react";
import { useAboutSections } from "./useAboutSections";
import AboutSectionCard from "./AboutCard";
import { AboutUs } from "@/app/data/AboutUsData";

export default function AboutSectionDashboard() {
  const { sections, setSections, handleUpdate, loading } = useAboutSections();

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;

  // Add a fallback for empty sections
  if (!sections || sections.length === 0) {
    return <p className="p-6 text-gray-500">No sections found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {sections.map((section: AboutUs) => (
        <AboutSectionCard
          key={section.id}
          section={section}
          onChange={(id, newDescription) =>
            setSections((prev) =>
              prev.map((s) =>
                s.id === id ? { ...s, description: newDescription } : s
              )
            )
          }
          onSave={handleUpdate}
        />
      ))}
    </div>
  );
}