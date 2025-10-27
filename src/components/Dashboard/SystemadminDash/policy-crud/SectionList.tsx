"use client";

import SectionForm from "./SectionForm";
import SectionItem from "./SectionItem";
import { useState } from "react";

interface Section {
  id: number;
  title: string;
  intro?: string;
  content?: string;
}

interface Props {
  policyId: number;
  sections: Section[];
  refresh: () => void;
}

export default function SectionList({ policyId, sections, refresh }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-gray-800">Sections</h4>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
        >
          + Add Section
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <SectionForm
            policyId={policyId}
            onClose={() => setShowForm(false)}
            onSaved={refresh}
          />
        </div>
      )}

      {sections.length === 0 ? (
        <p className="text-gray-500 text-sm">No sections yet.</p>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              policyId={policyId}
              refresh={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}