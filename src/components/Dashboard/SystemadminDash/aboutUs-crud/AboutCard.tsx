import React, { useEffect, useRef } from "react";
import { AboutUs } from "@/app/data/AboutUsData";

interface AboutSectionCardProps {
  section: AboutUs;
  onChange: (id: number, newDescription: string) => void;
  onSave: (section: AboutUs) => void;
}

export default function AboutSectionCard({
  section,
  onChange,
  onSave,
}: AboutSectionCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const allTextareas = document.querySelectorAll<HTMLTextAreaElement>("textarea.about-textarea");

    let maxHeight = 0;
    allTextareas.forEach((ta) => {
      ta.style.height = "auto";
      maxHeight = Math.max(maxHeight, ta.scrollHeight);
    });

    allTextareas.forEach((ta) => {
      ta.style.height = `${maxHeight}px`;
    });
  }, [section.description]); 

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <h2 className="text-xl font-bold">{section.section}</h2>
      <textarea
        ref={textareaRef}
        className="about-textarea w-full border p-2 mt-2 rounded resize-none overflow-hidden"
        value={section.description}
        onChange={(e) => onChange(section.id, e.target.value)}
      />
      <button
        onClick={() => onSave(section)}
        className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
