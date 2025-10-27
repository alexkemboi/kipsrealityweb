"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import SectionForm from "./SectionForm";

// Use the same markdown renderer as preview
const Markdown = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

interface Props {
  section: any;
  refresh: () => void;
  policyId: number;
}

export default function SectionItem({ section, refresh, policyId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this section?")) return;
    await fetch(`/api/policysections/${section.id}`, { method: "DELETE" });
    refresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">•</span> {section.title}
          </h3>
          {section.intro && (
            <p className="text-sm text-gray-600 mt-1">{section.intro}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setEditing(true)}
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
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Editing Mode */}
      {editing && (
        <div className="mt-4">
          <SectionForm
            section={section}
            policyId={policyId}
            onClose={() => setEditing(false)}
            onSaved={refresh}
          />
        </div>
      )}

      {/* View Mode */}
      {!editing && expanded && section.content && (
        <div 
          data-color-mode="light"
          className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-5 text-gray-800 overflow-auto"
        >
          <Markdown source={section.content} />
        </div>
      )}
    </div>
  );
}