import React, { useEffect, useRef } from "react";
import { Testimonial } from "@/app/data/TestimonialData";
import { toast } from "sonner";
interface TestimonialSectionCardProps {
  section: Testimonial;
  onChange: (id: number, field: keyof Testimonial, newValue: string) => void;
  onSave: (section: Testimonial) => void;
}

export default function TestimonialCard({
  section,
  onChange,
  onSave,
}: TestimonialSectionCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSave = () => {
  try {
    onSave(section)  
    toast.success("Testimonial saved successfully!") 
  } catch (error) {
    toast.error("Failed to save testimonial") 
  }
}


  useEffect(() => {
    const allTextareas = document.querySelectorAll<HTMLTextAreaElement>(
      "textarea.about-textarea"
    );
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
    <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={section.image || "https://via.placeholder.com/80"}
          alt={section.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/80";
          }}
          className="w-20 h-20 rounded-full object-cover border border-gray-300"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800">{section.name}</h2>
          <p className="text-gray-500">{section.role}</p>
        </div>
      </div>

      <div className="space-y-4">
       <div>
  <label className="block font-medium text-gray-700 mb-1">Name</label>
  <input
    type="text"
    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
    value={section.name}
    onChange={(e) => onChange(section.id, "name", e.target.value)}
  />

</div>

<div>
  <label className="block font-medium text-gray-700 mb-1">Role</label>
  <input
    type="text"
    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
    value={section.role}
    onChange={(e) => onChange(section.id, "role", e.target.value)}
  />

</div>


        <div>
          <label className="block font-medium text-gray-700 mb-1">Image URL</label>

          {/* Live preview */}
          <div className="mb-2">
            {section.image ? (
              <img
                src={section.image}
                alt={section.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/80";
                }}
                className="w-24 h-24 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            className="about-textarea w-full border border-gray-300 p-2 rounded-md resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={section.image}
            onChange={(e) => onChange(section.id, "image", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Testimonial</label>
          <textarea
            ref={textareaRef}
            className="about-textarea w-full border border-gray-300 p-2 rounded-md resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={section.text}
            onChange={(e) => onChange(section.id, "text", e.target.value)}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="mt-5 text-right">
        <button
          onClick={handleSave} 
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
