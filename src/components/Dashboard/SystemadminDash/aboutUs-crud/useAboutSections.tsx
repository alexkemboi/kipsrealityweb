"use client";

import { useState } from "react";
import { AboutUs } from "@/app/data/AboutUsData";

export function useAboutSections() {
  const [sections, setSections] = useState<AboutUs[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/aboutsection");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (section: AboutUs) => {
    try {
      const res = await fetch(`/api/aboutsection/${section.id}`, {
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

  return { sections, setSections, fetchSections, handleUpdate, loading };
}
