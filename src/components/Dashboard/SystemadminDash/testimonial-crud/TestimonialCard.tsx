import React, { useEffect, useRef } from "react";
import { Testimonial } from "@/app/data/TestimonialData";

interface TestimonialSectionCardProps {
  section: Testimonial;
 onChange: (
    id: number,
    field: keyof Testimonial,
    newValue: string
  ) => void;  onSave: (section: Testimonial) => void;
}

export default function TestimonialCard({
  section,
  onChange,
  onSave,
}: TestimonialSectionCardProps) {
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
  }, [section.name, section.role, section.image, section.text]); 

  return (
    <div className="p-4 bg-white shadow rounded-md">
        <div className="">
      <h2 className="text-xl font-bold">Name</h2>
      <textarea
        ref={textareaRef}
        className="about-textarea w-full border p-2 mt-2 rounded resize-none overflow-hidden"
        value={section.name}
        onChange={(e) => onChange(section.id, "name", e.target.value)}
      />

</div>


       <div className="">
      <h2 className="text-xl font-bold">Role</h2>
      <textarea
        ref={textareaRef}
        className="about-textarea w-full border p-2 mt-2 rounded resize-none overflow-hidden"
        value={section.role}
        onChange={(e) => onChange(section.id, "role", e.target.value)}
      />

</div>

  <div className="">
      <h2 className="text-xl font-bold">Image</h2>
      <textarea
        ref={textareaRef}
        className="about-textarea w-full border p-2 mt-2 rounded resize-none overflow-hidden"
        value={section.image}
        onChange={(e) => onChange(section.id, "image", e.target.value)}
      />

</div>

  <div className="">
      <h2 className="text-xl font-bold">Text</h2>
      <textarea
        ref={textareaRef}
        className="about-textarea w-full border p-2 mt-2 rounded resize-none overflow-hidden"
        value={section.text}
        onChange={(e) => onChange(section.id, "text", e.target.value)}
      />

</div>
      <button
        onClick={() => onSave(section)}
        className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
