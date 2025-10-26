"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";

interface Props {
  section: any;
  onEdit: () => void;
  refresh: () => void;
}

export default function SectionItem({ section, onEdit, refresh }: Props) {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this section?")) return;
    await fetch(`/api/policysections/${section.id}`, { method: "DELETE" });
    refresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 mb-4">
      <div className="flex justify-between items-start">
        {/* Section Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">•</span> {section.title}
          </h3>
          {section.intro && (
            <p className="text-sm text-gray-600 mt-1">{section.intro}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm transition-colors"
          >
            <Edit size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
          {section.content && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 text-gray-500 hover:text-gray-800 transition"
              title={expanded ? "Hide content" : "Show content"}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {expanded && section.content && (
        <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap max-h-80 overflow-auto">
          {typeof section.content === "object"
            ? JSON.stringify(section.content, null, 2)
            : section.content}
        </div>
      )}
    </div>
  );
}
