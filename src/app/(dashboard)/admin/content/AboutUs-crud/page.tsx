// src/app/admin/content/AboutUs-crud/page.tsx
"use client";

import { useEffect, useState } from "react";
import AboutSectionDashboard from "@/components/Dashboard/SystemadminDash/aboutUs-crud/AboutSectionDashboard";
import type { AboutUs } from "@/app/data/AboutUsData";

export default function AboutUsCRUDPage() {
  const [sections, setSections] = useState<AboutUs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function fetchSections() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/aboutsection", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch About sections (${res.status})`);
        }

        const data = (await res.json()) as AboutUs[];

        if (isMounted) {
          setSections(Array.isArray(data) ? data : []);
        }
      } catch (err: unknown) {
        // Ignore abort errors during unmount/navigation
        if ((err as { name?: string })?.name === "AbortError") return;

        const message =
          err instanceof Error ? err.message : "Something went wrong";

        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSections();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6" role="status" aria-live="polite">
        <p className="text-gray-500">Loading About sections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6" role="alert">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return <AboutSectionDashboard initialSections={sections} />;
}
