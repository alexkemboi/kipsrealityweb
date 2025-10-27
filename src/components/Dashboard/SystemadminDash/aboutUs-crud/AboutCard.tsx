"use client";
import { useEffect, useState } from "react";

import {AboutUs} from "@/app/data/AboutUsData";


export default function AboutSectionDashboard() {
  const [sections, setSections] = useState<AboutUs[]>([]);
 

  const fetchSections = async () => {
    const res = await fetch("/api/aboutsection");
    const data = await res.json();
    setSections(data);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleUpdate = async (section: AboutUs) => {
    await fetch(`/api/aboutsection/${section.id}`, {
     method: "PUT",
     headers: {"Content-Type": "application/json"},
     body: JSON.stringify(section),});
    fetchSections();
  };

   return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {sections.map((section) => (
        <div key={section.id} className="p-4 bg-white shadow rounded-md">
          <h2 className="text-xl font-bold">{section.section}</h2>
          <textarea
            className="w-full border p-2 mt-2 rounded"
            value={section.description}
            onChange={(e) =>
              setSections((prev) =>
                prev.map((s) =>
                  s.id === section.id ? { ...s, description: e.target.value } : s
                )
              )
            }
          />
          <button
            onClick={() => handleUpdate(section)}
            className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
          >
            Save Changes
          </button>
        </div>
      ))}
    </div>
  );
}