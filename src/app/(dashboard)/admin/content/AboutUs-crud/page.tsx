// src/app/admin/content/AboutUs-crud/page.tsx
"use client";

import { useEffect, useState } from "react";
import AboutSectionDashboard from "@/components/Dashboard/SystemadminDash/aboutUs-crud/AboutSectionDashboard";
import { AboutUs } from "@/app/data/AboutUsData";

export default function AboutUsCRUDPage() {
  const [sections, setSections] = useState<AboutUs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/aboutsection`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch About sections");
        const data = await res.json();
        setSections(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchSections();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return <AboutSectionDashboard initialSections={sections} />;
}
