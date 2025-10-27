"use client";
import { useEffect, useState } from "react";
import { AboutUs } from "@/app/data/AboutUsData";

export function useAboutSections() {
  const [sections, setSections] = useState<AboutUs[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/aboutsection"); // Make sure this matches your API route
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched sections:", data); // Debug log
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
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      fetchSections(); // Refresh data after update
    } catch (error) {
      console.error("Failed to update section:", error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return { sections, setSections, fetchSections, handleUpdate, loading };
}